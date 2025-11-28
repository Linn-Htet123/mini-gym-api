export class MemberResponseDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  emergency_contact?: string;
  created_at: Date;
  updated_at: Date;

  activeSubscription: {
    id: string;
    packageTitle: string;
    startDate: Date;
    endDate: Date;
    status: string;
    daysRemaining: number;
  } | null;

  user?: {
    id: string;
    email: string;
    role: string;
  };
}
