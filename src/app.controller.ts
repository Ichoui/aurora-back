import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AxiosResponse } from 'axios';
import { catchError, Observable, of } from 'rxjs';
import { ReqInterceptor } from './interceptor.service';
import { SWPC } from './swpc.model';

@UseInterceptors(ReqInterceptor)
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
        SWPC.OVATION_MAP,
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
        SWPC.FORECAST_SOLARCYCLE,
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarCycle SWPC API !';
        }),
      );
  }

  @Get('/forecast/solarwind')
  @HttpCode(200)
  getSolarWind$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
        SWPC.FORECAST_SOLARWIND,
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on solarWind SWPC API !';
        }),
      );
  }

  @Get('/instant/kp')
  @HttpCode(200)
  getInstantKp$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/json/boulder_k_index_1m.json',
        SWPC.INSTANT_KP,
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on KPi 1month SWPC API !';
        }),
      );
  }

  @Post('/instant/nowcast')
  @HttpCode(200)
  postNowcast$(@Body() coords: { lat: number; lng: number }): Observable<any> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
        SWPC.INSTANT_NOWCAST,
        coords
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on instant nowcast local API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/map/polenorth')
  @HttpCode(200)
  getPoleNorthMap$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json',
        SWPC.POLE_NORTH,
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on map pole north SWPC API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/map/polesouth')
  @HttpCode(200)
  getPoleSouthMap$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json',
        SWPC.POLE_SOUTH,
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on map pole south SWPC API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/forecast/twentysevendays')
  @HttpCode(200)
  get27DaysForecast$(): Observable<AxiosResponse<any>> {
    return this._appService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
        SWPC.TWENTY_SEVEN_DAYS,
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on 27 days SWPC API !';
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
        SWPC.FORECAST_KP,
      )
      .pipe(
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on KP Forecast API !';
        }),
      );
  }
}
