import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { ListMessageRequestDTO } from './dtos/request.dto';
import { ListMessageResponseDTO } from './dtos/response.dto';
import { plainToInstance } from 'class-transformer';
import { MessageDTO } from '@shared/dtos/message.dto';
import { Message } from '@shared/providers/database/entities';

@Injectable()
export class ListMessageService {
  constructor(@Inject('DATABASE_PROVIDER') private db: IDatabaseProviders) {}

  async execute({
    sender,
    startDate,
    endDate,
    safeLimit,
    cursor,
  }: ListMessageRequestDTO): Promise<ListMessageResponseDTO> {
    let result: {
      items: Message[];
      nextCursor?: string;
    } = {
      items: [],
    };

    if (sender) {
      result = await this.db.repositories.messageRepository.listBySender(
        sender,
        startDate,
        endDate,
        {
          limit: safeLimit,
          cursor,
        },
      );
    } else if (startDate && endDate) {
      result = await this.db.repositories.messageRepository.listByPeriod(startDate, endDate, {
        limit: safeLimit,
        cursor,
      });
    }

    const items = plainToInstance(MessageDTO, result.items, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      nextCursor: result.nextCursor ?? null,
    };
  }
}
