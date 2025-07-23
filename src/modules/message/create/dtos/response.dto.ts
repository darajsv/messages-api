import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@shared/modules/database/entities';
import { randomUUID } from 'crypto';

export class CreateMessageResponseDTO {
  @ApiProperty({ example: randomUUID() })
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  sender: string;

  @ApiProperty()
  sentAt: Date;

  @ApiProperty({ enum: MessageStatus })
  status: MessageStatus;
}
