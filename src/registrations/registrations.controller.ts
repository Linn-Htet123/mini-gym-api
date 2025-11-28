/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '@app/common/storage/storage.service';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { PaginatedResponseDto, PaginationDto } from '@app/common';
import { RejectRegistrationDto } from './dto/reject-registration.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { Roles } from '@app/common/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('member-packages-registrations')
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly storageService: StorageService,
  ) {}

  @Roles(UserRole.MEMBER)
  @Post()
  @UseInterceptors(FileInterceptor('payment_screenshot'))
  create(
    @Body() dto: CreateRegistrationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const saveFile = this.storageService.handleFileUpload(file);
    return this.registrationsService.create(dto, saveFile.filePath);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  findAll(@Query() query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    return this.registrationsService.findAll(query);
  }

  @Roles(UserRole.MEMBER)
  @Get('member')
  @UseGuards(JwtAuthGuard)
  getMyPackages(@Req() req: { user: { id: string } }) {
    return this.registrationsService.findMyPackages(req.user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.update(id, updateRegistrationDto);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/approve')
  async approveRegistration(@Param('id') id: string) {
    return this.registrationsService.approveRegistration(id);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/reject')
  async rejectRegistration(
    @Param('id') id: string,
    @Body() dto: RejectRegistrationDto,
  ) {
    return this.registrationsService.rejectRegistration(
      id,
      dto.rejection_reason,
    );
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
