import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_PROVIDER, notFound } from '@shared/constants';
import { MessageDTO } from '@shared/dtos/message.dto';
import { MessageStatus } from '@shared/providers/database/entities';
import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PatchMessageStatusService {
  constructor(@Inject(DATABASE_PROVIDER) private db: IDatabaseProviders) {}

  async execute(id: string, status: MessageStatus): Promise<MessageDTO> {
    const message = await this.db.repositories.messageRepository.findById(id);

    if (!message) {
      throw new NotFoundException(notFound('message'));
    }

    const updated = await this.db.repositories.messageRepository.updateStatus(
      message.sender,
      message.sentAt,
      status,
    );

    return plainToInstance(MessageDTO, updated);
  }
}
