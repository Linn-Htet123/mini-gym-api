import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['member'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      memberId: user.member?.id,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        memberId: user.member?.id,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['member'],
    });
  }

  async registerAdmin(
    registerAdminDto: RegisterAdminDto,
  ): Promise<AuthResponseDto> {
    const { email, password, name, adminSecretKey } = registerAdminDto;

    const correctSecretKey = process.env.ADMIN_SECRET_KEY!;
    if (adminSecretKey !== correctSecretKey) {
      throw new BadRequestException('Invalid admin secret key');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const admin = this.userRepository.create({
      email,
      password_hash,
      role: UserRole.ADMIN,
    });

    const savedAdmin = await this.userRepository.save(admin);

    const payload = {
      sub: savedAdmin.id,
      email: savedAdmin.email,
      role: savedAdmin.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: savedAdmin.id,
        email: savedAdmin.email,
        role: savedAdmin.role,
        name: name,
      },
    };
  }

  generateTestToken(userId: string, role: string): string {
    const payload = {
      sub: userId,
      email: 'test@example.com',
      role: role,
    };
    return this.jwtService.sign(payload);
  }
}
