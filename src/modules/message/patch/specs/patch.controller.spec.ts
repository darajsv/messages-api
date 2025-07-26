import { Test, TestingModule } from '@nestjs/testing';
import { MessageDTO } from '@shared/dtos/message.dto';
import { faker } from '@faker-js/faker';
import { PatchMessageStatusController } from '../patch.controller';
import { PatchMessageStatusService } from '../patch.service';
import { PatchMessageStatusRequestDTO } from '../dtos/request.dto';
import { MessageStatus } from '@shared/providers/database/entities';

describe('PatchMessageStatusController', () => {
  let controller: PatchMessageStatusController;
  let service: jest.Mocked<PatchMessageStatusService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatchMessageStatusController],
      providers: [
        {
          provide: PatchMessageStatusService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(PatchMessageStatusController);
    service = module.get(PatchMessageStatusService) as jest.Mocked<PatchMessageStatusService>;
  });

  it('delegates to PatchMessageStatusService.execute and returns its result', async () => {
    const id = faker.string.uuid();
    const status = faker.helpers.arrayElement(['sent', 'received', 'read']) as MessageStatus;

    const body: PatchMessageStatusRequestDTO = { status };

    const updated: MessageDTO = {
      id,
      content: faker.lorem.sentence(),
      sender: faker.internet.email(),
      sentAt: Date.now(),
      status,
    };

    service.execute.mockResolvedValue(updated);

    const result = await controller.handle(id, body);

    expect(service.execute).toHaveBeenCalledTimes(1);
    expect(service.execute).toHaveBeenCalledWith(id, status);
    expect(result).toEqual(updated);
  });
});
