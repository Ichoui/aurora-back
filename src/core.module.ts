import {  Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WeatherModule } from './weather/weather.module';
import { AuroraModule } from './aurora/aurora.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReqInterceptor } from './interceptor.service';
import { CityModule } from './city/city.module';

@Module({
  imports: [AuroraModule, WeatherModule, CityModule, CacheModule.register({ isGlobal: true })],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqInterceptor,
    },
  ],
})
export class CoreModule {}
