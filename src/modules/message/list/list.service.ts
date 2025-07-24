import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IDatabaseProviders } from '@shared/providers/database/interfaces';
import { ListMessageRequestDTO } from './dtos/request.dto';
import { ListMessageResponseDTO } from './dtos/response.dto';
import { plainToInstance } from 'class-transformer';
import { MessageDTO } from '@shared/dtos/message.dto';

@Injectable()
export class ListMessageService {
  constructor(@Inject('DATABASE_PROVIDER') private db: IDatabaseProviders) {}

  async execute({
    sender,
    limit,
    cursor,
  }: ListMessageRequestDTO): Promise<ListMessageResponseDTO> {
    const result =
      await this.db.repositories.messageRepository.queryBySenderPaginated(
        sender,
        { limit, cursor },
      );

    const items = plainToInstance(MessageDTO, result.items, {
      excludeExtraneousValues: true,
    });

    return {
      items,
      nextCursor: result.nextCursor ?? null,
    };
  }
}
