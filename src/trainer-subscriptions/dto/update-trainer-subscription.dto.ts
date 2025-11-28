import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainerSubscriptionDto } from './create-trainer-subscription.dto';

export class UpdateTrainerSubscriptionDto extends PartialType(
  CreateTrainerSubscriptionDto,
) {}
