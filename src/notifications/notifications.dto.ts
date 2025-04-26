import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class NotificationsDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  deviceUuid: string;

  @IsString()
  token: string;

  @IsString()
  locale: 'en' | 'fr';
}

export class NotificationBodyDto {
  @IsNotEmpty()
  @IsString()
  topic: 'kp';
}
