import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth.guard';

describe('JwtAuthGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: JwtAuthGuard;
  const ctx: any = {
    getHandler: () => null,
    getClass: () => {},
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new JwtAuthGuard(reflector);
  });

  it('returns true when route is marked @Public()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(expect.any(String), [
      ctx.getHandler?.(),
      ctx.getClass?.(),
    ]);
  });

  it('delegates to parent AuthGuard when route is not public', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const parentProto = Object.getPrototypeOf(JwtAuthGuard.prototype);
    const parentSpy = jest.spyOn(parentProto as any, 'canActivate').mockReturnValue(true);
    const result = guard.canActivate(ctx);

    expect(parentSpy).toHaveBeenCalledWith(ctx);
    expect(result).toBe(true);
  });
});
