import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateRegistrationDto {
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @IsUUID()
  @IsNotEmpty()
  packageId: string;
}
