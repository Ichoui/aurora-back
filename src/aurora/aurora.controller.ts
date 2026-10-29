import { BadRequestException, Body, Controller, Get, Header, HttpCode, Post, Query } from '@nestjs/common';
import { AuroraService } from './aurora.service';
import { CoordinatesDto } from '../common/coordinates.dto';
import { OptionalCoordinatesDto, OvationQueryDto, SolarWindQueryDto } from './aurora.dto';
import type { KpForecastPoint, NowcastResponse, OvationPoint, SolarCyclePoint, SwpcResponse } from './aurora-response.interface';
import type { JsonObject, JsonValue } from '../common/json.types';
import { ApiBody, ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import {
  jsonArraySchema,
  jsonObjectSchema,
  kpForecastSchema,
  nowcastSchema,
  ovationSchema,
  solarCycleSchema,
  swpcSchema,
} from '../openapi/response.schemas';

@ApiTags('Aurora')
@Controller()
export class AuroraController {
  constructor(private readonly _auroraService: AuroraService) {}

  @Get('/')
  @ApiProduces('text/html')
  @ApiOkResponse({ description: 'Service greeting', schema: { type: 'string', example: 'Hello Aurora Chasers!' } })
  auroraPath(): string {
    return this._auroraService.auroraPath();
  }

  @Post('/swpc')
  @ApiBody({ type: OptionalCoordinatesDto, required: false })
  @ApiOkResponse({ description: 'Combined NOAA datasets', schema: swpcSchema })
  @HttpCode(200)
  getAllSwpcData(@Body() _coords: OptionalCoordinatesDto): Promise<SwpcResponse> {
    return this._auroraService.getAllSwpcData();
  }

  @Get('/map/ovation')
  @Header('Content-Type', 'application/json')
  @ApiOkResponse({
    description: 'Map coordinate tuples, or probability for a complete coordinate pair; empty body if no coordinate matches',
    schema: ovationSchema,
  })
  getOvation(@Query() query: OvationQueryDto): Promise<OvationPoint[] | number | null> {
    const longitude = query.lng ?? query.long;
    if (query.lng !== undefined && query.long !== undefined && query.lng !== query.long) {
      throw new BadRequestException('Longitude aliases lng and long must match');
    }
    const coords = query.lat !== undefined && longitude !== undefined ? { lat: query.lat, lng: longitude } : undefined;
    return this._auroraService.getOvation(coords);
  }

  @Get('/forecast/solarcycle')
  @ApiOkResponse({ description: 'Solar-cycle predictions with historical sampling', schema: solarCycleSchema })
  getSolarCycle(): Promise<SolarCyclePoint[]> {
    return this._auroraService.getSolarCycle();
  }

  @Get('/forecast/solarwind1h')
  @ApiOkResponse({ description: 'Solar-wind samples with historical field names', schema: jsonArraySchema })
  getSolarWind1h(): Promise<JsonObject[]> {
    return this._auroraService.getSolarWind1h();
  }

  @Get('/forecast/solarwind7d')
  @ApiOkResponse({ description: 'Solar-wind time_tag/speed samples after firstDate, preserving historical thinning', schema: jsonArraySchema })
  getSolarWind7d(@Query() query: SolarWindQueryDto): Promise<JsonObject[]> {
    return this._auroraService.getSolarWind7d(query.firstDate);
  }

  @Get('/instant/kp')
  @ApiOkResponse({ description: 'Latest NOAA KP record; empty body when no data exists', schema: jsonObjectSchema })
  getInstantKp(): Promise<JsonObject | null> {
    return this._auroraService.getInstantKp();
  }

  @Post('/instant/nowcast')
  @ApiOkResponse({ description: 'Local probability from the shared Ovation dataset', schema: nowcastSchema })
  @HttpCode(200)
  getNowcast(@Body() coords: CoordinatesDto): Promise<NowcastResponse> {
    return this._auroraService.getNowcast(coords);
  }

  @Get('/map/polenorth')
  @ApiOkResponse({ description: 'NOAA north-pole animation metadata', schema: jsonArraySchema })
  getPoleNorthMap(): Promise<JsonValue> {
    return this._auroraService.getPoleNorthMap();
  }

  @Get('/map/polesouth')
  @ApiOkResponse({ description: 'NOAA south-pole animation metadata', schema: jsonArraySchema })
  getPoleSouthMap(): Promise<JsonValue> {
    return this._auroraService.getPoleSouthMap();
  }

  @Get('/forecast/twentysevendays')
  @ApiProduces('text/html')
  @ApiOkResponse({ description: 'Raw NOAA outlook text', schema: { type: 'string' } })
  get27DaysForecast(): Promise<string> {
    return this._auroraService.get27DaysForecast();
  }

  @Get('/forecast/kp')
  @ApiOkResponse({ description: 'Predicted KP indices', schema: kpForecastSchema })
  getKpForecast(): Promise<KpForecastPoint[]> {
    return this._auroraService.getKpForecast();
  }
}
