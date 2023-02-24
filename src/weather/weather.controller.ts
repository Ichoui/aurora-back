import { Controller, Get, HttpCode, Logger, UseInterceptors } from "@nestjs/common";
import { ReqInterceptor } from "../interceptor.service";
import { WeatherService } from "./weather.service";
import { AxiosResponse } from "axios";
import { Observable } from "rxjs";

@UseInterceptors(ReqInterceptor)
@Controller()
export class WeatherController {
  constructor(private readonly _weatherService: WeatherService) {}
  private readonly logger = new Logger(WeatherService.name);

  @Get()
  @HttpCode(200)
  reverseGeoCode$(): Observable<AxiosResponse<any>> {
    return this._weatherService.reverseGeoCode();
  }
}
