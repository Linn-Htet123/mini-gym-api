import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
export class RegisterAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  adminSecretKey: string;
}
