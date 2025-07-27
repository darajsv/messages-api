import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDTO } from './dtos/request.dto';
import env from '@config/env';
import { LoginResponseDTO } from './dtos/response.dto';

@Injectable()
export class LoginService {
  constructor() {}

  async execute(body: LoginRequestDTO): Promise<LoginResponseDTO> {
    const response = await fetch(`${env().auth0.issuerUrl}oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: body.clientId,
        client_secret: body.clientSecret,
        audience: env().auth0.audience,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Invalid credentials or network error');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }
}
