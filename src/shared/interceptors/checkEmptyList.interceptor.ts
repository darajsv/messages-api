import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class CheckEmptyListInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data: any) => {
        if (!data.length && !data.items?.length) {
          context.switchToHttp().getResponse().status(HttpStatus.NO_CONTENT);
        } else {
          return data;
        }
      }),
    );
  }
}
