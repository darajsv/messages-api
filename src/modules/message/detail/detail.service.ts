import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_PROVIDER, notFound } from '@shared/constants';
import { MessageDTO } from '@shared/dtos/message.dto';
import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DetailMessageService {
  constructor(@Inject(DATABASE_PROVIDER) private db: IDatabaseProviders) {}

  async execute(id: string): Promise<MessageDTO> {
    const message = await this.db.repositories.messageRepository.findById(id);

    if (!message) {
      throw new NotFoundException(notFound('message'));
    }

    return plainToInstance(MessageDTO, message);
  }
}
