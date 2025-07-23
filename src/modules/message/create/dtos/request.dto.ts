import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMessageRequestDTO {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsString()
  sender: string;
}
