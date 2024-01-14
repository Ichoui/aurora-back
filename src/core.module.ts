import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WeatherModule } from './weather/weather.module';
import { AuroraModule } from './aurora/aurora.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReqInterceptor } from './interceptor.service';
import { CityModule } from './city/city.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormconfig from '../ormconfig';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuroraModule,
    WeatherModule,
    CityModule,
    NotificationsModule,
    CacheModule.register({ isGlobal: true }),
    TypeOrmModule.forRoot(ormconfig),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqInterceptor,
    },
  ],
})
export class CoreModule {}
