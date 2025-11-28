export class TrainerResponseDto {
  id: string;
  name: string;
  specialization: string;
  profile_image_url?: string;
  bio?: string;
  price_per_month: number;
  created_at: Date;
  updated_at: Date;
}
