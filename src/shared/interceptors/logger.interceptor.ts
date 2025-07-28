import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON } from '@shared/constants';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON) private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const rawRes: any = res.raw;

    const start = process.hrtime.bigint();
    const reqId = (req.headers['x-request-id'] as string) ?? uuidv4();

    if (typeof rawRes.setHeader === 'function') {
      rawRes.setHeader('x-request-id', reqId);
    }

    const onFinish = () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

      this.logger.info('http_request_completed', {
        request_id: reqId,
        method: req.method,
        url: req.originalUrl,
        status_code: res.statusCode,
        duration_ms: durationMs.toFixed(2),
        ip: req.ip,
        user_agent: req.headers['user-agent'],
      });
    };

    if (typeof rawRes.once === 'function') {
      rawRes.once('finish', onFinish);
    }

    return next.handle().pipe(
      catchError((err) => {
        this.logger.error('http_request_failed', {
          request_id: reqId,
          method: req.method,
          url: req.originalUrl,
          status_code: err?.status ?? 500,
          message: err?.message,
          stack: err?.stack,
        });
        throw err;
      }),
    );
  }
}
