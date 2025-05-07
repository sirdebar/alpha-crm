import { IsNotEmpty, IsNumber, IsOptional, Min, IsBoolean, IsDateString } from 'class-validator';

export class UpdateCuratorFinanceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  profit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expenses?: number;
}

export class CuratorFinanceResponseDto {
  id: number;
  curatorId: number;
  profit: number;
  expenses: number;
  month: string;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CuratorFinanceStatsResponseDto {
  curatorId: number;
  curatorName: string;
  profit: number;
  expenses: number;
  netProfit: number;
}

export class TopCuratorsResponseDto {
  topCurators: CuratorFinanceStatsResponseDto[];
  totalProfit: number;
  totalExpenses: number;
} 