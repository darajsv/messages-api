import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginRequestDTO {
  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiProperty()
  @IsString()
  clientSecret: string;
}
