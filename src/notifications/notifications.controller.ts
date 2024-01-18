import { Body, Controller, Get, HttpCode, Post, UseInterceptors } from '@nestjs/common';
import { ReqInterceptor } from '../interceptor.service';
import { NotificationsService } from './notifications.service';
import { NotificationBodyDto, NotificationsDto } from './notifications.dto';
import { NotificationsEntity } from './notifications.entity';
import { error } from 'firebase-functions/logger';
import { SendResponse } from 'firebase-admin/lib/messaging/messaging-api';

@UseInterceptors(ReqInterceptor)
@Controller('push')
export class NotificationsController {
  constructor(private readonly _notificationsService: NotificationsService) {}

  @Post('/notification')
  @HttpCode(200)
  async sendNotification(@Body() body: NotificationBodyDto): Promise<SendResponse[] | void> {
    console.log('body ??');
    try {
      return await this._notificationsService.prepareNotifications(body);
    } catch (err) {
      error(err);
      throw 'An error happened with sending notifs to users !';
    }
  }

  @Post('/register-device')
  @HttpCode(200)
  async registerDevice(@Body() body: NotificationsDto): Promise<NotificationsEntity> {
    try {

      return await this._notificationsService.registerDevice(body.deviceUuid, body.token);
    } catch (err) {
      error(err);
      throw 'An error happened with registering new device !';
    }
  }

  @Post('/register-locale')
  @HttpCode(200)
  async registerLocale(@Body() body: NotificationsDto): Promise<NotificationsEntity> {
    try {
      return await this._notificationsService.registerLocale(body.deviceUuid, body.locale);
    } catch (err) {
      error(err);
      throw 'An error happened with registering locale device !';
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
