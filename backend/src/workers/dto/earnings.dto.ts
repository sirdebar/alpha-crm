import { IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateIncomeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  income: number;
}

export class EarningStatsResponseDto {
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  income: number;
} 