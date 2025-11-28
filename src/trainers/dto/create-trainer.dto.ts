import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTrainerDto {
  @IsString()
  name: string;

  @IsString()
  specialization: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsNumber()
  price_per_month: number;
}
