import { Controller, Get, HttpCode, Query, UseInterceptors } from '@nestjs/common';
import { ReqInterceptor } from '../interceptor.service';
import { WeatherService } from './weather.service';
import { AxiosResponse } from 'axios';
import { catchError, Observable } from 'rxjs';
import { error } from 'firebase-functions/logger';

@UseInterceptors(ReqInterceptor)
@Controller()
export class WeatherController {
  constructor(private readonly _weatherService: WeatherService) {}

  @Get('/geocode')
  @HttpCode(200)
  getGeocode(@Query() params: any): Observable<AxiosResponse<any>> {
    return this._weatherService.reverseGeoCode$(params).pipe(
      catchError(err => {
        error(err);
        throw 'An error happened with reverse geocode api !';
      }),
    );
  }

  @Get('/weather')
  @HttpCode(200)
  getWeather(@Query() params: any): Observable<AxiosResponse<any>> {
    return this._weatherService.getWeather$(params).pipe(
      catchError(err => {
        error(err);
        throw 'An  error happened with weather api !';
      }),
    );
  }
}
