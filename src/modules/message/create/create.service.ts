import { Inject, Injectable } from '@nestjs/common';
import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { CreateMessageRequestDTO } from './dtos/request.dto';
import { Message } from '@shared/providers/database/entities';
import { MessageDTO } from '@shared/dtos/message.dto';
import { plainToInstance } from 'class-transformer';
import { DATABASE_PROVIDER } from '@shared/constants';

@Injectable()
export class CreateMessageService {
  constructor(@Inject(DATABASE_PROVIDER) private db: IDatabaseProviders) {}

  async execute(body: CreateMessageRequestDTO): Promise<MessageDTO> {
    const message = await this.db.repositories.messageRepository.create(
      new Message(body.content, body.sender),
    );

    return plainToInstance(MessageDTO, message);
  }
}
