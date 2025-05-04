import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsBoolean()
  present: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateAttendanceDto {
  @IsNotEmpty()
  @IsBoolean()
  present: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class AttendanceRecordResponseDto {
  date: string;
  present: boolean;
  reason?: string;
}

export class WorkerAttendanceResponseDto {
  totalDays: number;
  bestStreak: number;
  records: AttendanceRecordResponseDto[];
  weeklyPercentage: number;
} 