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

@Controller('member-packages-registrations')
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('payment_screenshot'))
  create(
    @Body() dto: CreateRegistrationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const saveFile = this.storageService.handleFileUpload(file);
    return this.registrationsService.create(dto, saveFile.filePath);
  }

  @Get()
  findAll(@Query() query: PaginationDto): Promise<PaginatedResponseDto<any>> {
    return this.registrationsService.findAll(query);
  }

  @Get('member')
  @UseGuards(JwtAuthGuard)
  getMyPackages(@Req() req: { user: { id: string } }) {
    return this.registrationsService.findMyPackages(req.user.id);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
  ) {
    return this.registrationsService.update(id, updateRegistrationDto);
  }

  @Post(':id/approve')
  async approveRegistration(@Param('id') id: string) {
    return this.registrationsService.approveRegistration(id);
  }

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
