import { IsNotEmpty, IsString } from 'class-validator';

export class RejectRegistrationDto {
  @IsNotEmpty()
  @IsString()
  rejection_reason: string;
}
