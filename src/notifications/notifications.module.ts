import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsEntity } from './notifications.entity';

@Module({
  imports: [HttpModule.register({ timeout: 20000 }), TypeOrmModule.forFeature([NotificationsEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
