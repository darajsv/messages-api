import { Module } from '@nestjs/common';
import { CreateMessageController } from './create/create.controller';
import { CreateMessageService } from './create/create.service';
import { DetailMessageController } from './detail/detail.controller';
import { DetailMessageService } from './detail/detail.service';

@Module({
  imports: [],
  controllers: [CreateMessageController, DetailMessageController],
  providers: [CreateMessageService, DetailMessageService],
})
export class MessageModule {}
