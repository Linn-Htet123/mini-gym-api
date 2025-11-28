import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: configService.get<number>('JWT_EXPIRES_IN') || 604800, // 7 days
        },
      }),
    }),
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class GatewaysModule {}
