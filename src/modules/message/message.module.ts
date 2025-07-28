import { Module } from '@nestjs/common';
import { CreateMessageController } from './create/create.controller';
import { CreateMessageService } from './create/create.service';
import { DetailMessageController } from './detail/detail.controller';
import { DetailMessageService } from './detail/detail.service';
import { ListMessageController } from './list/list.controller';
import { ListMessageService } from './list/list.service';
import { PatchMessageStatusController } from './patch/patch.controller';
import { PatchMessageStatusService } from './patch/patch.service';

@Module({
  imports: [],
  controllers: [
    CreateMessageController,
    DetailMessageController,
    ListMessageController,
    PatchMessageStatusController,
  ],
  providers: [
    CreateMessageService,
    DetailMessageService,
    ListMessageService,
    PatchMessageStatusService,
  ],
})
export class MessageModule {}
