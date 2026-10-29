import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import type { JsonObject } from '../common/json.types';
import { GeocodeQueryDto, WeatherQueryDto } from './weather.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { jsonArraySchema, jsonObjectSchema } from '../openapi/response.schemas';

@ApiTags('Weather')
@Controller()
export class WeatherController {
  constructor(private readonly _weatherService: WeatherService) {}

  @Get('/geocode')
  @ApiOkResponse({ description: 'Raw OpenWeather reverse-geocoding results', schema: jsonArraySchema })
  @HttpCode(200)
  getGeocode(@Query() params: GeocodeQueryDto): Promise<JsonObject[]> {
    return this._weatherService.reverseGeoCode(params);
  }

  @Get('/weather')
  @ApiOkResponse({ description: 'Raw OpenWeather forecast', schema: jsonObjectSchema })
  @HttpCode(200)
  getWeather(@Query() params: WeatherQueryDto): Promise<JsonObject> {
    return this._weatherService.getWeather(params);
  }
}
