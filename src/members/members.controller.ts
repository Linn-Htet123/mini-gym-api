import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';
import { PaginationDto, PaginatedResponseDto } from '@app/common';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<MemberResponseDto> {
    return await this.membersService.create(createMemberDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<MemberResponseDto> {
    return await this.membersService.findOne(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponseDto<MemberResponseDto>> {
    return await this.membersService.findAllWithSubscriptions(query);
  }
}
