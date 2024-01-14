import { Body, Controller, Get, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { ReqInterceptor } from '../interceptor.service';
import { NotificationsService } from './notifications.service';
import { NotificationsDto } from './notifications.dto';
import { NotificationsEntity } from './notifications.entity';
import { error } from 'firebase-functions/logger';

@UseInterceptors(ReqInterceptor)
@Controller('push')
export class NotificationsController {
  constructor(private readonly _notificationsService: NotificationsService) {}

  @Post('/notification')
  @HttpCode(200)
  async sendNotification(@Body() body: { title: string; description: string }): Promise<void> {
    console.log('body ??');
    try {
      return await this._notificationsService.sendNotification(body);
    } catch (err) {
      error(err);
      throw 'An error happened with sending notifs to users !';
    }
  }

  @Post('/register')
  @HttpCode(200)
  async registerDevice(@Body() body: NotificationsDto): Promise<NotificationsEntity> {
    try {
      return await this._notificationsService.registerDevice(body.token, body.deviceUuid);
    } catch (err) {
      error(err);
      throw 'An error happened with registering new device !';
    }
  }

  @Get('/tokens/obsolete')
  @HttpCode(200)
  async detectObsoleteTokens(): Promise<void> {
    try {
      return await this._notificationsService.detectObsoleteTokens();
    } catch (err) {
      error(err);
      throw 'An error happened with detection of obsolete tokens !';
    }
  }
}
