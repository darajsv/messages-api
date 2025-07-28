import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'EitherSenderOrDateRange', async: false })
class EitherSenderOrDateRangeConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const { sender, startDate, endDate } = args.object as any;
    const hasSender = !!sender;
    const hasStartAndEnd = !!startDate && !!endDate;
    return hasSender || hasStartAndEnd;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'You must provide either sender or both startDate and endDate';
  }
}
export class ListMessageRequestDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sender: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(5)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  get safeLimit(): number {
    return this.limit ?? 10;
  }

  @Validate(EitherSenderOrDateRangeConstraint)
  _validationGroup: string;
}
