import { Test, TestingModule } from '@nestjs/testing';
import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { MessageDTO } from '@shared/dtos/message.dto';
import { NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { DATABASE_PROVIDER, notFound } from '@shared/constants';
import { DetailMessageService } from '../detail.service';

describe('DetailMessageService', () => {
  const findById = jest.fn();
  const dbMock: IDatabaseProviders = {
    repositories: { messageRepository: { findById } },
  } as unknown as IDatabaseProviders;

  let service: DetailMessageService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DetailMessageService, { provide: DATABASE_PROVIDER, useValue: dbMock }],
    }).compile();

    service = module.get(DetailMessageService);
  });

  it('returns a MessageDTO when the message exists', async () => {
    const id = faker.string.uuid();
    const saved = {
      id,
      content: faker.lorem.sentence(),
      sender: faker.internet.email(),
      sentAt: Date.now(),
      status: 'sent',
    };

    findById.mockResolvedValue(saved);

    const result = await service.execute(id);

    expect(findById).toHaveBeenCalledWith(id);
    expect(result).toBeInstanceOf(MessageDTO);
    expect(result).toEqual(saved);
  });

  it('throws NotFoundException when the message does not exist', async () => {
    const id = faker.string.uuid();
    findById.mockResolvedValue(undefined);

    await expect(service.execute(id)).rejects.toEqual(new NotFoundException(notFound('message')));
    expect(findById).toHaveBeenCalledWith(id);
  });
});
