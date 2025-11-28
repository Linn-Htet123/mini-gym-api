import { IsUUID, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTrainerSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @IsUUID()
  @IsNotEmpty()
  trainerId: string;

  @IsNumber()
  durationMonths: number;
}
