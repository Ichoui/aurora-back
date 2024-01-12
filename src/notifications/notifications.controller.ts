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

  @Post('/notification/kp')
  @HttpCode(200)
  notificationKp(@Body() body: any): Promise<void> {
    console.log('body ??');
    return this._notificationsService.notificationsKp();
    // .pipe(
    // catchError(err => {
    //   error(err);
    //   throw 'An error happened with push notifs !';
    // }),
    // );
  }

  @Post('/register')
  @HttpCode(200)
  async registerDevice(@Body() body: NotificationsDto): Promise<NotificationsEntity> {
    try {
      return await this._notificationsService.registerDevice(body.token, body.deviceUuid);
    } catch (err) {
      error(err);
      throw 'An error happened with push notifs !';
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
