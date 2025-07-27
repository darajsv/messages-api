import { Test, TestingModule } from '@nestjs/testing';

import { UnauthorizedException } from '@nestjs/common';

jest.mock('@config/env', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    auth0: {
      issuerUrl: 'https://example.auth0.com/',
      audience: 'https://api.example.com/',
    },
  })),
}));

const fetchMock = jest.fn();
global.fetch = fetchMock as any;

import { LoginService } from '../login.service';
import { LoginRequestDTO } from '../dtos/request.dto';

describe('LoginService', () => {
  let service: LoginService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginService],
    }).compile();

    service = module.get(LoginService);
  });

  it('returns token data on 200 OK', async () => {
    const body: LoginRequestDTO = { clientId: 'ID', clientSecret: 'SECRET' };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'TOKEN123',
        expires_in: 3600,
        token_type: 'Bearer',
      }),
    });

    const res = await service.execute(body);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.auth0.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      }),
    );

    expect(res).toEqual({
      accessToken: 'TOKEN123',
      expiresIn: 3600,
      tokenType: 'Bearer',
    });
  });

  it('throws UnauthorizedException on non-OK response', async () => {
    fetchMock.mockResolvedValue({ ok: false });

    await expect(service.execute({ clientId: 'bad', clientSecret: 'bad' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
