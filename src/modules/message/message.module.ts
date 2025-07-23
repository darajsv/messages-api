import { Module } from '@nestjs/common';
import { CreateMessageController } from './create/create.controller';
import { CreateMessageService } from './create/create.service';
import { DatabaseModule } from '@shared/modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CreateMessageController],
  providers: [CreateMessageService],
})
export class MessageModule {}
