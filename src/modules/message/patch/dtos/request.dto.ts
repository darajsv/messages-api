import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@shared/providers/database/entities';
import { IsEnum } from 'class-validator';

export class PatchMessageStatusRequestDTO {
  @ApiProperty({ enum: MessageStatus, examples: MessageStatus })
  @IsEnum(MessageStatus)
  status: MessageStatus;
}
