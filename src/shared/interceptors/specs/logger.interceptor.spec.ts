import { of, throwError } from 'rxjs';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { HttpLoggerInterceptor } from '../logger.interceptor';

describe('HttpLoggerInterceptor', () => {
  const loggerMock = {
    info: jest.fn(),
    error: jest.fn(),
  } as any;

  const makeHttpContext = () => {
    const req: any = {
      method: 'GET',
      url: '/messages',
      originalUrl: '/messages',
      headers: {},
      ip: '127.0.0.1',
    };

    const raw: any = {
      once: jest.fn((event, cb) => {
        raw._cb = cb;
      }),
      setHeader: jest.fn(),
    };

    const res: any = {
      statusCode: 200,
      raw,
      header: jest.fn(),
    };

    const ctx: any = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    };

    return { ctx: ctx as ExecutionContext, req, res, raw };
  };

  const interceptor = new HttpLoggerInterceptor(loggerMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('logs when the response finishes', (done) => {
    const { ctx, raw } = makeHttpContext();

    const next: CallHandler = {
      handle: () => of('OK'),
    } as any;

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        raw._cb();
        expect(raw.setHeader).toHaveBeenCalledWith('x-request-id', expect.any(String));
        expect(loggerMock.info).toHaveBeenCalledWith(
          'http_request_completed',
          expect.objectContaining({
            method: 'GET',
            url: '/messages',
            status_code: 200,
          }),
        );
        done();
      },
      error: done.fail,
    });
  });

  it('logs an error and rethrows', (done) => {
    const { ctx } = makeHttpContext();

    const next: CallHandler = {
      handle: () => throwError(() => new Error('boom')),
    } as any;

    interceptor.intercept(ctx, next).subscribe({
      next: () => done.fail('should have errored'),
      error: () => {
        expect(loggerMock.error).toHaveBeenCalledWith(
          'http_request_failed',
          expect.objectContaining({
            method: 'GET',
            url: '/messages',
            status_code: 500,
            message: 'boom',
          }),
        );
        done();
      },
    });
  });

  it('ignores non-HTTP contexts', () => {
    const ctx: any = {
      getType: () => 'rpc',
    };

    const next: CallHandler = { handle: jest.fn(() => of(true)) } as any;

    interceptor.intercept(ctx as ExecutionContext, next).subscribe();

    expect(next.handle).toHaveBeenCalled();
    expect(loggerMock.info).not.toHaveBeenCalled();
    expect(loggerMock.error).not.toHaveBeenCalled();
  });
});
