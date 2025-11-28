import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { Public } from '@app/common/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Public()
  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<MemberResponseDto> {
    return await this.membersService.create(createMemberDto);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<MemberResponseDto> {
    return await this.membersService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    return await this.membersService.findAllWithSubscriptions(query);
  }
}
