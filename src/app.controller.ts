import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(204)
  auroraPath(): string {
    return this.appService.auroraPath();
  }

  @Get('/map/ovation')
  getOvation(): string {
    return this.appService.getTest(
      'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
    );
  }

  @Get('/aurora/forecast/solarcycle')
  getSolarCycle(): string {
    return this.appService.getTest(
      'https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json',
    );
  }
  @Get('/aurora/instant/kp')
  getInstantKp(): string {
    return this.appService.getTest(
      'https://services.swpc.noaa.gov/json/boulder_k_index_1m.json',
    );
  }
  @Get('/aurora/instant/solarWind')
  getSolarWind(): string {
    return this.appService.getTest(
      'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
    );
  }
}
