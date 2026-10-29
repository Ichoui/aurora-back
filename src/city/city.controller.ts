import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { CityService } from './city.service';
import type { City } from '../interfaces/city.interface';
import type { CitySearchResult } from './city.service';
import { CityQueryDto } from './city-query.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { citySchema, legacyCitySchema } from '../openapi/response.schemas';

@ApiTags('Cities')
@Controller()
export class CityController {
  constructor(private readonly _cityService: CityService) {}

  /**
   * @deprecated
   * */
  @Get('/city')
  @ApiOperation({ deprecated: true, summary: 'Legacy city search' })
  @ApiOkResponse({
    description: 'Legacy records; empty body when search is missing or shorter than three characters',
    schema: { type: 'array', items: legacyCitySchema },
  })
  @HttpCode(200)
  async getOldGeocode(@Query() params: CityQueryDto): Promise<City[] | null> {
    return this._cityService.findLegacyCities(params.search);
  }

  @Get('/cities')
  @ApiOkResponse({ description: 'Matching cities; empty array for missing or short searches', schema: { type: 'array', items: citySchema } })
  @HttpCode(200)
  getGeocode(@Query() params: CityQueryDto): Promise<CitySearchResult[]> {
    return this._cityService.findCorrespondingCities(params.search);
  }
}
