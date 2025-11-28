import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class CreateMembershipPackageDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  duration_days: number;

  @IsOptional()
  is_active?: boolean;
}
