const envMockReturn = {
  auth0: { audience: 'my-api', issuerUrl: 'https://auth.example.com/' },
};
jest.mock('@config/env', () => ({
  __esModule: true,
  default: jest.fn(() => envMockReturn),
}));
import env from '@config/env';

const jwtFromHeaderFn = jest.fn();
const StrategyMock = jest.fn().mockImplementation(function (opts, verify) {
  this.options = opts;
  this.verify = verify;
  this.name = 'jwt';
});

jest.mock('passport-jwt', () => ({
  __esModule: true,
  Strategy: StrategyMock,
  ExtractJwt: {
    fromAuthHeaderAsBearerToken: jest.fn(() => jwtFromHeaderFn),
  },
}));

const secretProvider = jest.fn();
jest.mock('jwks-rsa', () => ({
  __esModule: true,
  passportJwtSecret: jest.fn(() => secretProvider),
}));
import { passportJwtSecret } from 'jwks-rsa';

import { JwtStrategy } from '../jwt.strategy';

describe('JwtStrategy', () => {
  it('configures passport-jwt Strategy with values from env()', () => {
    const strat = new JwtStrategy();

    expect(env).toHaveBeenCalled();
    expect(StrategyMock).toHaveBeenCalledTimes(1);

    const [cfg] = StrategyMock.mock.calls[0];
    expect(cfg).toEqual({
      jwtFromRequest: jwtFromHeaderFn,
      audience: envMockReturn.auth0.audience,
      issuer: envMockReturn.auth0.issuerUrl,
      algorithms: ['RS256'],
      secretOrKeyProvider: secretProvider,
    });

    expect(passportJwtSecret).toHaveBeenCalledWith(
      expect.objectContaining({
        jwksUri: 'https://auth.example.com/.well-known/jwks.json',
        cache: true,
        rateLimit: true,
      }),
    );

    const payload = { sub: 'user123', scope: 'read' };
    expect(strat.validate(payload)).toBe(payload);
  });
});
