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

interface UserRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Get()
  findMyNotifications(@Req() req: UserRequest) {
    return this.notificationsService.findAllForUser(req.user.id);
  }

  @Get('unread')
  findUnread(@Req() req: UserRequest) {
    return this.notificationsService.findUnread(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: UserRequest) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

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

  @Post('broadcast')
  broadcastToAll(@Body() body: { message: string }) {
    return this.notificationsService.broadcastToAll(body.message);
  }
}
