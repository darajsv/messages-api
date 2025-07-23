import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@shared/providers/database/entities';
import { randomUUID } from 'crypto';

export class MessageDTO {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  sender: string;

  @ApiProperty()
  sentAt: string;

  @ApiProperty({ enum: MessageStatus })
  status: MessageStatus;
}
