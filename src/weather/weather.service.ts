import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";

@Injectable()
export class WeatherService {
  constructor(private readonly _httpService: HttpService) {
  }

  reverseGeoCode(): Observable<AxiosResponse<any>> {
    return this._httpService.get('https://api.openweathermap.org/geo/1.0/reverse')
  }
}
