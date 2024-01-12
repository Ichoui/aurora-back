import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class NotificationsDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  deviceUuid: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
