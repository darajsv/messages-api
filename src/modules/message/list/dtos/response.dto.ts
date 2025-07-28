import { ApiProperty } from '@nestjs/swagger';
import { MessageDTO } from '@shared/dtos/message.dto';
import { Expose, Type } from 'class-transformer';

export class ListMessageResponseDTO {
  @ApiProperty({ type: () => [MessageDTO] })
  @Type(() => MessageDTO)
  @Expose()
  items: MessageDTO[];

  @ApiProperty({ example: 'base64' })
  @Expose()
  nextCursor: string | null;
}
