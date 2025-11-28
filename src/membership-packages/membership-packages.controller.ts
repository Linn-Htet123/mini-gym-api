import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MembershipPackagesService } from './membership-packages.service';
import { CreateMembershipPackageDto } from './dto/create-membership-package.dto';
import { UpdateMembershipPackageDto } from './dto/update-membership-package.dto';
import { PaginationDto } from '@app/common';
import { UpdateMembershipPackageStatusDto } from './dto/update-membership-package-status.dto';

@Controller('membership-packages')
export class MembershipPackagesController {
  constructor(
    private readonly membershipPackagesService: MembershipPackagesService,
  ) {}

  @Post()
  create(@Body() createMembershipPackageDto: CreateMembershipPackageDto) {
    return this.membershipPackagesService.create(createMembershipPackageDto);
  }

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.membershipPackagesService.findAll(query);
  }

  @Get('active')
  findAllActive(@Query() query: PaginationDto) {
    return this.membershipPackagesService.findAllActive(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membershipPackagesService.findOne(id);
  }

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

  @Patch('status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatus: UpdateMembershipPackageStatusDto,
  ) {
    return this.membershipPackagesService.updateStatus(id, updateStatus);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membershipPackagesService.remove(id);
  }
}
