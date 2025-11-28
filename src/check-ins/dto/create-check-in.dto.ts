import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCheckInDto {
  @IsUUID()
  @IsNotEmpty()
  memberId: string;
}
