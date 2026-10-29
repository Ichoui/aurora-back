import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WeatherModule } from './weather/weather.module';
import { AuroraModule } from './aurora/aurora.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuroraHeaderGuard } from './common/aurora-header.guard';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { CityModule } from './city/city.module';

@Module({
  imports: [
    AuroraModule,
    WeatherModule,
    CityModule,
    CacheModule.register({ isGlobal: true }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuroraHeaderGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class CoreModule {}
