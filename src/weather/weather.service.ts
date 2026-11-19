import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { JsonObject } from '../common/json.types';
import { fetchUpstream } from '../common/upstream-http';
import type { GeocodeQueryDto, OpenWeatherCoordinatesDto, WeatherQueryDto } from './weather.dto';

function queryParams(params: OpenWeatherCoordinatesDto): Record<string, unknown> {
  const query = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
  const serverKey = process.env.OPENWEATHER_API_KEY?.trim();
  if (params.appid === undefined && serverKey) query.appid = serverKey;
  return query;
}

@Injectable()
export class WeatherService {
  constructor(private readonly _httpService: HttpService) {}

  reverseGeoCode(params: GeocodeQueryDto): Promise<JsonObject[]> {
    return fetchUpstream<JsonObject[]>(this._httpService, 'https://api.openweathermap.org/geo/1.0/reverse', { params: queryParams(params) });
  }

  getWeather(params: WeatherQueryDto): Promise<JsonObject> {
    return fetchUpstream<JsonObject>(this._httpService, 'https://api.openweathermap.org/data/3.0/onecall', { params: queryParams(params) });
  }
}
