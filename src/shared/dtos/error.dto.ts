import { ApiProperty } from '@nestjs/swagger';

export class ErrorDTO {
  @ApiProperty({ description: 'A human-readable error message' })
  message: string;

  @ApiProperty({ description: 'The HTTP status code' })
  statusCode: number;

  @ApiProperty({
    required: false,
    description: 'Optional error details or cause',
  })
  error?: string;
}
