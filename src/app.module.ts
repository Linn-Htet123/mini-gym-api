import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule, LoggerMiddleware } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MembersModule } from './members/members.module';
import { MembershipPackagesModule } from './membership-packages/membership-packages.module';
import { GatewaysModule } from './gateways/gateways.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './users/users.module';
import { TrainersModule } from './trainers/trainers.module';
import { TrainerSubscriptionsModule } from './trainer-subscriptions/trainer-subscriptions.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME || process.env.DB_USER || 'gymuser',
      password: process.env.DB_PASSWORD || 'gympass',
      database: process.env.DB_NAME || 'gymdb',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),

    AuthModule,
    RegistrationsModule,
    SubscriptionsModule,
    CheckInsModule,
    NotificationsModule,
    UsersModule,
    MembersModule,
    MembershipPackagesModule,
    GatewaysModule,
    TrainersModule,
    TrainerSubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
