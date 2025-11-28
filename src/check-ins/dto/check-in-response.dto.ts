import { CheckInStatus } from '../entities/check-in.entity';

export class CheckInResponseDto {
  id: string;
  check_in_status: CheckInStatus;
  check_in_time: Date;
  denial_reason: string | null;
  member: {
    id: string;
    name: string;
    phone: string;
    status: string;
  };
  subscription: {
    id: string;
    package_title: string;
    start_date: Date;
    end_date: Date;
    status: string;
    days_remaining: number;
  } | null;
}
