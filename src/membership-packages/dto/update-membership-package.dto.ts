import { PartialType } from '@nestjs/mapped-types';
import { CreateMembershipPackageDto } from './create-membership-package.dto';

export class UpdateMembershipPackageDto extends PartialType(
  CreateMembershipPackageDto,
) {}
