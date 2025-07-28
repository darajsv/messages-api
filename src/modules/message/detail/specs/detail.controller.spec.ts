import { Test, TestingModule } from '@nestjs/testing';
import { MessageDTO } from '@shared/dtos/message.dto';
import { faker } from '@faker-js/faker';
import { DetailMessageController } from '../detail.controller';
import { DetailMessageService } from '../detail.service';
import { MessageStatus } from '@shared/providers/database/entities';

describe('DetailMessageController', () => {
  let controller: DetailMessageController;
  let service: jest.Mocked<DetailMessageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetailMessageController],
      providers: [
        {
          provide: DetailMessageService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(DetailMessageController);
    service = module.get(DetailMessageService) as jest.Mocked<DetailMessageService>;
  });

  it('delegates to DetailMessageService.execute and returns the DTO', async () => {
    const id = faker.string.uuid();
    const dto: MessageDTO = {
      id,
      content: faker.lorem.sentence(),
      sender: faker.internet.email(),
      sentAt: Date.now(),
      status: MessageStatus.SENT,
    };

    service.execute.mockResolvedValue(dto);

    const result = await controller.handle(id);

    expect(service.execute).toHaveBeenCalledTimes(1);
    expect(service.execute).toHaveBeenCalledWith(id);
    expect(result).toEqual(dto);
  });
});
