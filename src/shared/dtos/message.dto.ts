import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@shared/providers/database/entities';
import { Expose, Transform } from 'class-transformer';
import { randomUUID } from 'crypto';

export class MessageDTO {
  @ApiProperty({ example: randomUUID() })
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  sender: string;

  @ApiProperty({ example: new Date() })
  @Expose()
  @Transform(({ value }) => new Date(Number(value)), {
    toPlainOnly: true,
  })
  sentAt!: number;

  @ApiProperty({ enum: MessageStatus })
  @Expose()
  status: MessageStatus;
}
