import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CityController } from './city.controller';
import { CityService } from './city.service';

@Module({
  imports: [HttpModule.register({ timeout: 20000 })],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
