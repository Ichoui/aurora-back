import { Controller, Get, HttpCode, Logger, Query, UseInterceptors } from "@nestjs/common";
import { ReqInterceptor } from "../interceptor.service";
import { WeatherService } from "./weather.service";
import { AxiosResponse } from "axios";
import { catchError, Observable } from "rxjs";

@UseInterceptors(ReqInterceptor)
@Controller()
export class WeatherController {
  constructor(private readonly _weatherService: WeatherService) {}
  private readonly logger = new Logger(WeatherService.name);

  @Get('/geocode')
  @HttpCode(200)
  getGeocode(@Query() params): Observable<AxiosResponse<any>> {
    return this._weatherService.reverseGeoCode$(params).pipe(
      catchError((err) => {
        this.logger.error(err);
        throw 'An error happened with reverse geocode api !';
      }),
    );
  }

  @Get('/weather')
  @HttpCode(200)
  getWeather(@Query() params): Observable<AxiosResponse<any>> {
    return this._weatherService.getWeather$(params).pipe(
      catchError((err) => {
        this.logger.error(err);
        throw 'An error happened with weather api !';
      }),
    );
  }
}
