import { CacheModule, Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { AuroraModule } from './aurora/aurora.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReqInterceptor } from './interceptor.service';

@Module({
  imports: [
    AuroraModule,
    WeatherModule,
    CacheModule.register({ isGlobal: true }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqInterceptor,
    },
  ],
})
export class CoreModule {}
