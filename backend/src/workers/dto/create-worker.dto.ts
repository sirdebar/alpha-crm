import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWorkerDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsString()
  tag?: string;
} 