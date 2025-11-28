export class RegistrationResponseDto {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  memberEmail?: string;
  packageId: string;
  packageTitle: string;
  payment_screenshot_url: string;
  registration_status: string;
  createdAt: Date;
  updatedAt: Date;
}
