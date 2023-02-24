import { Module } from '@nestjs/common';
import { AuroraController } from './aurora.controller';
import { AuroraService } from './aurora.service';
import { HttpModule } from '@nestjs/axios';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ReqInterceptor } from '../interceptor.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  controllers: [AuroraController],
  providers: [
    AuroraService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ReqInterceptor,
    },
  ],
})
export class AuroraModule {}
