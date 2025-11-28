import { IsString, IsOptional } from 'class-validator';
export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  emergency_contact?: string;
}
