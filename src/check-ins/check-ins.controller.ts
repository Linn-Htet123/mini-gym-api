import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Public } from '@app/common/decorators/public.decorator';
import { CheckInStatus } from './entities/check-in.entity';
import { Roles } from '@app/common/decorators/role.decorator';

@Controller('check-ins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Roles(UserRole.ADMIN)
  @Public()
  @Post()
  async checkIn(@Body() createCheckInDto: CreateCheckInDto) {
    const result = await this.checkInsService.checkIn(createCheckInDto);
    return {
      data: result,
      message:
        result.check_in_status === CheckInStatus.ALLOWED
          ? 'Check-in successful! Welcome!'
          : `Check-in denied: ${result.denial_reason}`,
    };
  }

  @Roles(UserRole.ADMIN)
  @Get('member/:memberId')
  async getMemberCheckIns(@Param('memberId') memberId: string) {
    const checkIns = await this.checkInsService.getMemberCheckIns(memberId);
    return {
      data: checkIns,
      message: 'Check-in history retrieved successfully',
    };
  }
}
