import { Test, TestingModule } from '@nestjs/testing';
import { MessageDTO } from '@shared/dtos/message.dto';
import { CreateMessageService } from '../create.service';
import { CreateMessageController } from '../create.controller';
import { CreateMessageRequestDTO } from '../dtos/request.dto';
import { MessageStatus } from '@shared/providers/database/entities';
import { faker } from '@faker-js/faker/.';
import { randomUUID } from 'crypto';

describe('CreateMessageController', () => {
  let controller: CreateMessageController;
  let service: jest.Mocked<CreateMessageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateMessageController],
      providers: [
        {
          provide: CreateMessageService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(CreateMessageController);
    service = module.get<CreateMessageService, jest.Mocked<CreateMessageService>>(
      CreateMessageService,
    );
  });

  it('delegates to CreateMessageService.execute and returns its result', async () => {
    const content = faker.lorem.sentence();
    const sender = faker.internet.email();

    const dto: CreateMessageRequestDTO = { content, sender };

    const created: MessageDTO = {
      id: faker.string.uuid(),
      content,
      sender,
      sentAt: Date.now(),
      status: MessageStatus.SENT,
    };

    service.execute.mockResolvedValue(created);

    const result = await controller.handle(dto);

    expect(service.execute).toHaveBeenCalledTimes(1);
    expect(service.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });
});
