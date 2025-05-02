import { IsNumber, IsPositive, Min } from 'class-validator';

export class AddCodesDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  count: number;
} 