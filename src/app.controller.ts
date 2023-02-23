import { Controller, Get, HttpCode, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { AxiosResponse } from 'axios';
import { catchError, map, Observable, tap } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}
  private readonly logger = new Logger(AppService.name);

  @Get()
  @HttpCode(204)
  auroraPath$(): string {
    return this._appService.auroraPath();
  }

  @Get('/map/ovation')
  @HttpCode(200)
  getOvation$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on ovation map SWPC API !';
        }),
      );
  }

  @Get('/forecast/solarcycle')
  @HttpCode(200)
  getSolarCycle$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json',
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarCycle SWPC API !';
        }),
      );
  }

  @Get('/instant/kp')
  @HttpCode(200)
  getInstantKp$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/json/boulder_k_index_1m.json',
      )
      .pipe(
        tap((e) => {
          console.log(e);
          this.logger.log(e);
        }),
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on KPi 1month SWPC API !';
        }),
      );
  }

  @Get('/instant/solarWind')
  @HttpCode(200)
  getSolarWind$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarWind SWPC API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/map/poleNorth')
  @HttpCode(200)
  getPoleNorthMap$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json',
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarWind SWPC API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/map/poleSouth')
  @HttpCode(200)
  getPoleSouthMap$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json',
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarWind SWPC API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/forecast/twentysevendays')
  @HttpCode(200)
  get27DaysForecast$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$('https://services.swpc.noaa.gov/text/27-day-outlook.txt')
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarWind SWPC API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/forecast/kp')
  @HttpCode(200)
  getKpForecast$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarWind SWPC API !';
        }),
      );
  }
}
