import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MembershipPackagesService } from './membership-packages.service';
import { CreateMembershipPackageDto } from './dto/create-membership-package.dto';
import { UpdateMembershipPackageDto } from './dto/update-membership-package.dto';
import { PaginationDto } from '@app/common';
import { UpdateMembershipPackageStatusDto } from './dto/update-membership-package-status.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('membership-packages')
export class MembershipPackagesController {
  constructor(
    private readonly membershipPackagesService: MembershipPackagesService,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createMembershipPackageDto: CreateMembershipPackageDto) {
    return this.membershipPackagesService.create(createMembershipPackageDto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.membershipPackagesService.findAll(query);
  }

  @Roles(UserRole.MEMBER)
  @Get('active')
  findAllActive(@Query() query: PaginationDto) {
    return this.membershipPackagesService.findAllActive(query);
  }
  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membershipPackagesService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMembershipPackageDto: UpdateMembershipPackageDto,
  ) {
    return this.membershipPackagesService.update(
      id,
      updateMembershipPackageDto,
    );
  }

  @Roles(UserRole.ADMIN)
  @Patch('status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatus: UpdateMembershipPackageStatusDto,
  ) {
    return this.membershipPackagesService.updateStatus(id, updateStatus);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membershipPackagesService.remove(id);
  }
}
