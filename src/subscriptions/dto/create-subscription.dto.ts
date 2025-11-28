import { SubscriptionStatus } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  memberId: string;
  packageId: string;
  registrationId: string;
  start_date: Date;
  end_date: Date;
  status: SubscriptionStatus;
  payment_amount: number;
  payment_screenshot_url?: string;
}
