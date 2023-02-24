import { Module } from '@nestjs/common';
import { AuroraService } from './aurora.service';
import { HttpModule } from '@nestjs/axios';
import { AuroraController } from './aurora.controller';

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  controllers: [AuroraController],
  providers: [AuroraService],
})
export class AuroraModule {}
