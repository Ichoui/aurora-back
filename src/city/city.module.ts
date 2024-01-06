import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity } from './city.entity';

@Module({
  imports: [HttpModule.register({ timeout: 20000 }), TypeOrmModule.forFeature([CityEntity])],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
