import { Body, Controller, Get, HttpCode, Logger, Post, Query, UseInterceptors } from '@nestjs/common';
import { AuroraService } from './aurora.service';
import { catchError, from, Observable } from 'rxjs';
import { ReqInterceptor } from '../interceptor.service';
import { SERVICES_SWPC, SWPC } from './swpc.model';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@UseInterceptors(ReqInterceptor)
@Controller()
export class AuroraController {
  constructor(private readonly _auroraService: AuroraService) {}
  private readonly logger = new Logger(AuroraService.name);

  @Get('/')
  @HttpCode(200)
  auroraPath$(): string {
    // Testing if everything works!
    return this._auroraService.auroraPath$();
  }

  @Post('/swpc')
  @HttpCode(200)
  getAllSwpcDatas$(@Body() coords: { lat: number; lng: number }): Observable<{
    forecastSolarCycle: any;
    forecastSolarWind: any;
    forecastKp: any;
    forecastTwentySevenDays: any;
    instantKp: any;
  }> {
    return from(this._auroraService.getAllSwpcDatas$(coords)).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on NOAA SWPC API !';
      }),
    );
  }

  @Get('/map/ovation')
  @CacheKey('ovationData')
  @CacheTTL(30 * 60000) // override TTL to 30 * 60000 milliseconds
  @HttpCode(200)
  getOvation$(@Query() coords?: { lat: number; lng: number }): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.OVATION_MAP, SWPC.OVATION_MAP, coords).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on ovation map NOAA SWPC API !';
      }),
    );
  }

  @Get('/forecast/solarcycle')
  @HttpCode(200)
  getSolarCycle$(): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.FORECAST_SOLARCYCLE, SWPC.FORECAST_SOLARCYCLE).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on solarCycle NOAA SWPC API !';
      }),
    );
  }

  @Get('/forecast/solarwind1h')
  @HttpCode(200)
  getSolarWind1h$(): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.FORECAST_SOLARWIND_1H, SWPC.FORECAST_SOLARWIND_1H).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on solarWind 1hour NOAA SWPC API !';
      }),
    );
  }

  @Get('/forecast/solarwind7d')
  @HttpCode(200)
  getSolarWind7d$(@Query() firstDate: string): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.FORECAST_SOLARWIND_7D, SWPC.FORECAST_SOLARWIND_7D, { date: firstDate }).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on solarWind 7 days NOAA SWPC API !';
      }),
    );
  }

  @Get('/instant/kp')
  @HttpCode(200)
  getInstantKp$(): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.INSTANT_KP, SWPC.INSTANT_KP).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on KPi 1 month NOAA SWPC API !';
      }),
    );
  }

  @Post('/instant/nowcast')
  @HttpCode(200)
  postNowcast$(@Body() coords: { lat: number; lng: number }): Observable<Promise<number>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.INSTANT_NOWCAST, SWPC.INSTANT_NOWCAST, coords).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on instant nowcast local API !';
      }),
    );
  }

  @Get('/map/polenorth')
  @HttpCode(200)
  getPoleNorthMap$(): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.POLE_NORTH, SWPC.POLE_NORTH).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on map pole north NOAA SWPC API !';
      }),
    );
  }

  @Get('/map/polesouth')
  @HttpCode(200)
  getPoleSouthMap$(): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.POLE_SOUTH, SWPC.POLE_SOUTH).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on map pole south NOAA SWPC API !';
      }),
    );
  }

  @Get('/forecast/twentysevendays')
  @HttpCode(200)
  get27DaysForecast$(): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.TWENTY_SEVEN_DAYS, SWPC.TWENTY_SEVEN_DAYS).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on 27 days NOAA SWPC API !';
      }),
    );
  }

  @Get('/forecast/kp')
  @HttpCode(200)
  getKpForecast$(): Observable<Promise<any>> {
    return this._auroraService.getOneSwpcData$(SERVICES_SWPC.FORECAST_KP, SWPC.FORECAST_KP).pipe(
      catchError(err => {
        this.logger.error(err);
        throw 'An error happened on KP Forecast API !';
      }),
    );
  }
}
