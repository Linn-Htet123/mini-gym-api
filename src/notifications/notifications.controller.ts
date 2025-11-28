import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
  Post,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { NotificationType } from './entities/notification.entity';
import { RolesGuard } from '@app/common/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from '@app/common/decorators/role.decorator';

interface UserRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  findMyNotifications(@Req() req: UserRequest) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Get('unread')
  findUnread(@Req() req: UserRequest) {
    return this.notificationsService.findUnread(req.user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Patch('read-all')
  markAllAsRead(@Req() req: UserRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Roles(UserRole.ADMIN)
  @Post('admin/broadcast')
  broadcastToAdmins(
    @Body()
    body: {
      type: NotificationType;
      title: string;
      message: string;
    },
  ) {
    return this.notificationsService.broadcastToAdmins(
      body.type,
      body.title,
      body.message,
    );
  }

  @Roles(UserRole.ADMIN, UserRole.MEMBER)
  @Post('broadcast')
  broadcastToAll(@Body() body: { message: string }) {
    return this.notificationsService.broadcastToAll(body.message);
  }
}
