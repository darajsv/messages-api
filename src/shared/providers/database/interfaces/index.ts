import { MessageRepository } from '../repositories';

export interface IDatabaseProviders {
  repositories: {
    messageRepository: MessageRepository;
  };
}
