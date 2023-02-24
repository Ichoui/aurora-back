import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuroraService } from './aurora.service';
import { catchError, Observable, tap } from 'rxjs';
import { ReqInterceptor } from '../interceptor.service';
import { SWPC } from './swpc.model';

@UseInterceptors(ReqInterceptor)
@Controller()
export class AuroraController {
  constructor(private readonly _auroraService: AuroraService) {}
  private readonly logger = new Logger(AuroraService.name);

  @Get('/')
  @HttpCode(200)
  auroraPath(): string {
    return this._auroraService.auroraPath$();
  }

  @Get('/map/ovation')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('custom-key')
  @CacheTTL(30 * 60000) // override TTL to 30 * 60000 milliseconds
  @HttpCode(200)
  getOvation(): Observable<Promise<any>> {
    return this._auroraService
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
  getSolarCycle(): Observable<Promise<any>> {
    return this._auroraService
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
  getSolarWind(): Observable<Promise<any>> {
    return this._auroraService
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
  getInstantKp(): Observable<Promise<any>> {
    return this._auroraService
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
  postNowcast(
    @Body() coords: { lat: number; lng: number },
  ): Observable<Promise<number>> {
    return this._auroraService
      .getSwpcData$(
        'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
        SWPC.INSTANT_NOWCAST,
        coords,
      )
      .pipe(
        tap((e) => console.log('ICI OK', e)),
        catchError((err) => {
          this.logger.error(err);
          throw 'An error happened on instant nowcast local API !';
        }),
      );
  }

  /** Do not rewrite */
  @Get('/map/polenorth')
  @HttpCode(200)
  getPoleNorthMap(): Observable<Promise<any>> {
    return this._auroraService
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
  getPoleSouthMap(): Observable<Promise<any>> {
    return this._auroraService
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
  get27DaysForecast(): Observable<Promise<any>> {
    return this._auroraService
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
  getKpForecast(): Observable<Promise<any>> {
    return this._auroraService
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
