import { Test, TestingModule } from '@nestjs/testing';
import { Message } from '@shared/providers/database/entities';
import { MessageDTO } from '@shared/dtos/message.dto';
import { CreateMessageService } from '../create.service';
import { DATABASE_PROVIDER } from '@shared/constants';
import { CreateMessageRequestDTO } from '../dtos/request.dto';
import { faker } from '@faker-js/faker';

describe('CreateMessageService', () => {
  const createMock = jest.fn();

  const dbMock = {
    repositories: {
      messageRepository: { create: createMock },
    },
  };

  let service: CreateMessageService;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateMessageService, { provide: DATABASE_PROVIDER, useValue: dbMock }],
    }).compile();

    service = module.get(CreateMessageService);
  });

  it('creates a Message entity and returns a MessageDTO', async () => {
    const content = faker.lorem.sentence();
    const sender = faker.internet.email();

    const dto: CreateMessageRequestDTO = { content, sender };

    const savedMessage: Message = {
      id: faker.string.uuid(),
      content,
      sender,
      sentAt: faker.date.recent().getTime(),
      status: 'sent',
    } as Message;

    createMock.mockResolvedValue(savedMessage);

    const result = await service.execute(dto);

    expect(createMock).toHaveBeenCalledTimes(1);
    const [passedEntity] = createMock.mock.calls[0];
    expect(passedEntity).toBeInstanceOf(Message);
    expect(passedEntity).toMatchObject({ content, sender });

    expect(result).toBeInstanceOf(MessageDTO);
    expect(result).toEqual(savedMessage);
  });
});
