import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [HttpModule.register({ timeout: 20000 })],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
