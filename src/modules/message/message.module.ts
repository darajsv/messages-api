import { Module } from '@nestjs/common';
import { CreateMessageController } from './create/create.controller';
import { CreateMessageService } from './create/create.service';
import { DetailMessageController } from './detail/detail.controller';
import { DetailMessageService } from './detail/detail.service';
import { ListMessageController } from './list/list.controller';
import { ListMessageService } from './list/list.service';

@Module({
  imports: [],
  controllers: [
    CreateMessageController,
    DetailMessageController,
    ListMessageController,
  ],
  providers: [CreateMessageService, DetailMessageService, ListMessageService],
})
export class MessageModule {}
