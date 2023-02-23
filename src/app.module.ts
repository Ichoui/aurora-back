import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReqInterceptor } from './interceptor.service';

@Module({
  // {timeout: 10000}
  imports: [HttpModule.register({})],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqInterceptor,
    },
  ],
})
export class AppModule {}
