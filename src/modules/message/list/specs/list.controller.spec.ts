import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker';
import { ListMessageController } from '../list.controller';
import { ListMessageService } from '../list.service';
import { ListMessageRequestDTO } from '../dtos/request.dto';
import { ListMessageResponseDTO } from '../dtos/response.dto';
import { MessageStatus } from '@shared/providers/database/entities';

describe('ListMessageController', () => {
  let controller: ListMessageController;
  let service: jest.Mocked<ListMessageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListMessageController],
      providers: [
        {
          provide: ListMessageService,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(ListMessageController);
    service = module.get(ListMessageService) as jest.Mocked<ListMessageService>;
  });

  it('delegates to ListMessageService.execute and returns its result', async () => {
    const query: ListMessageRequestDTO = {
      sender: faker.internet.email(),
      startDate: undefined,
      endDate: undefined,
      limit: 20,
      cursor: undefined,
      _validationGroup: undefined,
      get safeLimit() {
        return this.limit ?? 10;
      },
    } as unknown as ListMessageRequestDTO;

    const response: ListMessageResponseDTO = {
      items: [
        {
          id: faker.string.uuid(),
          content: faker.lorem.sentence(),
          sender: query.sender,
          sentAt: Date.now(),
          status: MessageStatus.SENT,
        },
      ],
      nextCursor: null,
    };

    service.execute.mockResolvedValue(response);

    const result = await controller.handle(query);

    expect(service.execute).toHaveBeenCalledTimes(1);
    expect(service.execute).toHaveBeenCalledWith(query);
    expect(result).toEqual(response);
  });
});
