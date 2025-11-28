import { IsBoolean } from 'class-validator';

export class UpdateMembershipPackageStatusDto {
  @IsBoolean()
  is_active: boolean;
}
