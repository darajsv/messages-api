import { Test, TestingModule } from '@nestjs/testing';
import { Observable, of } from 'rxjs';
import { CheckEmptyListInterceptor } from '@shared/interceptors/checkEmptyList.interceptor';

describe('CheckEmptyListInterceptor', () => {
  let interceptor: CheckEmptyListInterceptor;
  let executionContext: any;
  let callHandler: { handle: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckEmptyListInterceptor],
    }).compile();

    interceptor = module.get<CheckEmptyListInterceptor>(CheckEmptyListInterceptor);

    executionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnThis(),
      status: jest.fn(),
    };

    callHandler = {
      handle: jest.fn(),
    };
  });

  it('sets HTTP 204 when payload is an empty array', (done) => {
    callHandler.handle.mockReturnValueOnce(of([]));

    const result = interceptor.intercept(executionContext, callHandler) as Observable<any>;

    result.subscribe(() => {
      expect(executionContext.status).toHaveBeenCalledWith(204);
      done();
    });
  });

  it('sets HTTP 204 when payload.items is empty', (done) => {
    callHandler.handle.mockReturnValueOnce(of({ data: [] }));

    const result = interceptor.intercept(executionContext, callHandler) as Observable<any>;

    result.subscribe(() => {
      expect(executionContext.status).toHaveBeenCalledWith(204);
      done();
    });
  });

  it('passes through non-empty payload unchanged', (done) => {
    const testData = [1, 2, 3];
    callHandler.handle.mockReturnValueOnce(of(testData));

    const result = interceptor.intercept(executionContext, callHandler) as Observable<any>;

    result.subscribe((data) => {
      expect(executionContext.switchToHttp().getResponse().status).not.toHaveBeenCalled();
      expect(data).toEqual(testData);
      done();
    });
  });
});
