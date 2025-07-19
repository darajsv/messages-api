import { TestRepository } from '../repositories';

export interface IDatabaseProviders {
  repositories: {
    testRepository: TestRepository;
  };
}
