import { Inject, Injectable } from '@nestjs/common';
import { IDatabaseProviders } from '@shared/modules/database/interfaces';
import { CreateMessageRequestDTO } from './dtos/request.dto';
import { Message } from '@shared/modules/database/entities';
import { CreateMessageResponseDTO } from './dtos/response.dto';

@Injectable()
export class CreateMessageService {
  constructor(@Inject('DATABASE_PROVIDER') private db: IDatabaseProviders) {}

  async execute(
    body: CreateMessageRequestDTO,
  ): Promise<CreateMessageResponseDTO> {
    return this.db.repositories.messageRepository.create(
      new Message(body.content, body.sender),
    );
  }
}
