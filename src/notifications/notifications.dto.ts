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
  locale: 'EN' | 'FR';
}

export class NotificationBodyDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
