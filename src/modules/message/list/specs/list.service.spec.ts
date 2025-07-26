import { Test, TestingModule } from '@nestjs/testing';
import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { Message, MessageStatus } from '@shared/providers/database/entities';
import { MessageDTO } from '@shared/dtos/message.dto';
import { faker } from '@faker-js/faker';
import { DATABASE_PROVIDER } from '@shared/constants';
import { ListMessageService } from '../list.service';
import { ListMessageRequestDTO } from '../dtos/request.dto';
import { ListMessageResponseDTO } from '../dtos/response.dto';

describe('ListMessageService', () => {
  const listBySender = jest.fn();
  const listByPeriod = jest.fn();

  const dbMock: IDatabaseProviders = {
    repositories: {
      messageRepository: { listBySender, listByPeriod },
    },
  } as unknown as IDatabaseProviders;

  let service: ListMessageService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ListMessageService, { provide: DATABASE_PROVIDER, useValue: dbMock }],
    }).compile();

    service = module.get(ListMessageService);
  });

  const newMessage = (overrides: Partial<Message> = {}): Partial<Message> => ({
    id: faker.string.uuid(),
    content: faker.lorem.sentence(),
    sender: faker.internet.email(),
    sentAt: Date.now(),
    status: MessageStatus.SENT,
    sentMonth: overrides.sentMonth,
  });

  it('lists by sender when sender is provided', async () => {
    const sender = faker.internet.email();
    const dto: ListMessageRequestDTO = {
      sender,
      startDate: undefined,
      endDate: undefined,
      limit: 15,
      cursor: undefined,
      _validationGroup: undefined,
      get safeLimit() {
        return this.limit ?? 10;
      },
    } as unknown as ListMessageRequestDTO;

    const repoResult = {
      items: [newMessage({ sender })],
      nextCursor: 'next123',
    };
    listBySender.mockResolvedValue(repoResult);

    const result = await service.execute(dto);

    expect(listBySender).toHaveBeenCalledWith(sender, undefined, undefined, {
      limit: dto.safeLimit,
      cursor: undefined,
    });
    expect(listByPeriod).not.toHaveBeenCalled();

    expect(result).toMatchObject<ListMessageResponseDTO>({
      items: repoResult.items.map((m) => expect.any(MessageDTO)),
      nextCursor: 'next123',
    });
    expect(result.items[0]).toEqual(repoResult.items[0]);
  });

  it('lists by period when startDate and endDate are provided', async () => {
    const dto: ListMessageRequestDTO = {
      sender: undefined,
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      limit: undefined,
      cursor: 'cursorABC',
      _validationGroup: undefined,
      get safeLimit() {
        return this.limit ?? 10;
      },
    } as unknown as ListMessageRequestDTO;

    const repoResult = {
      items: [newMessage()],
      nextCursor: null,
    };
    listByPeriod.mockResolvedValue(repoResult);

    const result = await service.execute(dto);

    expect(listByPeriod).toHaveBeenCalledWith(dto.startDate, dto.endDate, {
      limit: dto.safeLimit,
      cursor: 'cursorABC',
    });
    expect(listBySender).not.toHaveBeenCalled();

    expect(result).toEqual({
      items: expect.arrayContaining([expect.any(MessageDTO)]),
      nextCursor: null,
    });
  });

  it('returns empty list & null cursor when no filter provided', async () => {
    const dto: ListMessageRequestDTO = {
      sender: undefined,
      startDate: undefined,
      endDate: undefined,
      limit: undefined,
      cursor: undefined,
      _validationGroup: undefined,
      get safeLimit() {
        return this.limit ?? 10;
      },
    } as unknown as ListMessageRequestDTO;

    const result = await service.execute(dto);

    expect(listBySender).not.toHaveBeenCalled();
    expect(listByPeriod).not.toHaveBeenCalled();

    expect(result).toEqual<ListMessageResponseDTO>({
      items: [],
      nextCursor: null,
    });
  });
});
