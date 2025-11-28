export class MembershipPackageResponseDto {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration_days: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  registration_count: number;
  subscription_count: number;
}
