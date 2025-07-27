import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker';
import { LoginController } from '../login.controller';
import { LoginService } from '../login.service';
import { LoginRequestDTO } from '../dtos/request.dto';
import { LoginResponseDTO } from '../dtos/response.dto';

describe('LoginController', () => {
  let controller: LoginController;
  let service: jest.Mocked<LoginService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(LoginController);
    service = module.get(LoginService) as jest.Mocked<LoginService>;
  });

  it('delegates to LoginService.execute and returns its result', async () => {
    const request: LoginRequestDTO = {
      clientId: faker.string.uuid(),
      clientSecret: faker.string.alphanumeric(32),
    };

    const response: LoginResponseDTO = {
      accessToken: faker.string.alphanumeric(24),
      expiresIn: 7200,
      tokenType: 'Bearer',
    };

    service.execute.mockResolvedValue(response);

    const result = await controller.handle(request);

    expect(service.execute).toHaveBeenCalledTimes(1);
    expect(service.execute).toHaveBeenCalledWith(request);
    expect(result).toEqual(response);
  });
});
