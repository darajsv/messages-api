import { Inject, Injectable } from '@nestjs/common';
import { IDatabaseProviders } from '@shared/modules/database/interfaces';
import { CreateMessageRequestDTO } from './dtos/request.dto';
import { Message } from '@shared/modules/database/entities';

@Injectable()
export class CreateMessageService {
  constructor(@Inject('DATABASE_PROVIDER') private db: IDatabaseProviders) {}

  async execute(body: CreateMessageRequestDTO): Promise<void> {
    await this.db.repositories.messageRepository.create(
      Message.newInstanceFromDTO(body),
    );
    const ha = await this.db.repositories.messageRepository.findAll();
    console.log(ha);
  }
}
