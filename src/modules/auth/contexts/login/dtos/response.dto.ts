import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class LoginResponseDTO {
  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsNumber()
  expiresIn: number;

  @ApiProperty()
  @IsString()
  tokenType: string;
}
