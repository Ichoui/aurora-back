import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class WeatherService {
  constructor(private readonly _httpService: HttpService) {}

  reverseGeoCode$(params: any): Observable<AxiosResponse<any>> {
    return this._httpService.get('https://api.openweathermap.org/geo/1.0/reverse', { params }).pipe(map(res => res.data));
  }

  getWeather$(params: any): Observable<AxiosResponse<any>> {
    return this._httpService.get('https://api.openweathermap.org/data/3.0/onecall', { params }).pipe(map(res => res.data));
  }
}
