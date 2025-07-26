import { Test, TestingModule } from '@nestjs/testing';
import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { MessageDTO } from '@shared/dtos/message.dto';
import { NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Message, MessageStatus } from '@shared/providers/database/entities';
import { DATABASE_PROVIDER, notFound } from '@shared/constants';
import { PatchMessageStatusService } from '../patch.service';

describe('PatchMessageStatusService', () => {
  const findById = jest.fn();
  const updateStatus = jest.fn();

  const dbMock: IDatabaseProviders = {
    repositories: {
      messageRepository: { findById, updateStatus },
    },
  } as unknown as IDatabaseProviders;

  let service: PatchMessageStatusService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PatchMessageStatusService, { provide: DATABASE_PROVIDER, useValue: dbMock }],
    }).compile();

    service = module.get(PatchMessageStatusService);
  });

  const newMessage = (overrides: Partial<Message> = {}) => ({
    id: faker.string.uuid(),
    content: faker.lorem.sentence(),
    sender: faker.internet.email(),
    sentAt: Date.now(),
    status: 'sent' as MessageStatus,
    ...overrides,
  });

  it('updates status when message exists', async () => {
    const id = faker.string.uuid();
    const status = 'read' as MessageStatus;
    const found = newMessage();
    const updated = { ...found, status };

    findById.mockResolvedValue(found);
    updateStatus.mockResolvedValue(updated);

    const result = await service.execute(id, status);

    expect(findById).toHaveBeenCalledWith(id);
    expect(updateStatus).toHaveBeenCalledWith(found.sender, found.sentAt, status);

    expect(result).toBeInstanceOf(MessageDTO);
    expect(result).toEqual(updated);
  });

  it('throws NotFoundException when message does not exist', async () => {
    const id = faker.string.uuid();
    findById.mockResolvedValue(undefined);

    await expect(service.execute(id, 'received' as MessageStatus)).rejects.toEqual(
      new NotFoundException(notFound('message')),
    );
    expect(updateStatus).not.toHaveBeenCalled();
  });
});
