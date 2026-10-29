import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Cache } from 'cache-manager';
import { SERVICES_SWPC } from './swpc.model';
import type { CoordinatesDto } from '../common/coordinates.dto';
import type { JsonObject, JsonValue } from '../common/json.types';
import { fetchUpstream } from '../common/upstream-http';
import type { KpForecastPoint, NowcastResponse, OvationPoint, SolarCyclePoint, SwpcResponse } from './aurora-response.interface';
import {
  findOvationProbability,
  InvalidNoaaPayloadError,
  mapOvationCoordinates,
  readInstantKp,
  readNoaaText,
  readOvationCoordinates,
  transformKpForecast,
  transformSolarCycle,
  transformSolarWind1h,
  transformSolarWind7d,
} from './noaa-transformers';

@Injectable()
export class AuroraService {
  private readonly _ttl = 30 * 60 * 1000;
  private _ovationInFlight: Promise<OvationPoint[]> | undefined;

  constructor(
    private readonly _httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly _cacheService: Cache,
  ) {}

  auroraPath(): string {
    return 'Hello Aurora Chasers!';
  }

  async getAllSwpcData(): Promise<SwpcResponse> {
    const [forecastSolarCycle, forecastSolarWind, forecastKp, forecastTwentySevenDays, instantKp] = await Promise.all([
      this.getSolarCycle(),
      this.getSolarWind1h(),
      this.getKpForecast(),
      this.get27DaysForecast(),
      this.getInstantKp(),
    ]);
    return { forecastSolarCycle, forecastSolarWind, forecastKp, forecastTwentySevenDays, instantKp };
  }

  async getOvation(coords?: CoordinatesDto): Promise<OvationPoint[] | number | null> {
    if (coords === undefined) {
      const cachedMap = await this._cacheService.get<OvationPoint[]>('ovationMapCache');
      if (cachedMap !== undefined) return cachedMap;
    }
    const coordinates = await this._loadOvationCoordinates();
    return coords === undefined ? mapOvationCoordinates(coordinates) : findOvationProbability(coordinates, coords);
  }

  getSolarCycle(): Promise<SolarCyclePoint[]> {
    return this._fetchTransformed(SERVICES_SWPC.FORECAST_SOLARCYCLE, transformSolarCycle);
  }

  getSolarWind1h(): Promise<JsonObject[]> {
    return this._fetchTransformed(SERVICES_SWPC.FORECAST_SOLARWIND_1H, transformSolarWind1h);
  }

  getSolarWind7d(firstDate: string): Promise<JsonObject[]> {
    return this._fetchTransformed(SERVICES_SWPC.FORECAST_SOLARWIND_7D, data => transformSolarWind7d(data, firstDate));
  }

  getKpForecast(): Promise<KpForecastPoint[]> {
    return this._fetchTransformed(SERVICES_SWPC.FORECAST_KP, transformKpForecast);
  }

  getInstantKp(): Promise<JsonObject | null> {
    return this._fetchTransformed(SERVICES_SWPC.INSTANT_KP, readInstantKp);
  }

  async getNowcast(coords: CoordinatesDto): Promise<NowcastResponse> {
    return { nowcast: findOvationProbability(await this._loadOvationCoordinates(), coords) };
  }

  getPoleNorthMap(): Promise<JsonValue> {
    return fetchUpstream<JsonValue>(this._httpService, SERVICES_SWPC.POLE_NORTH);
  }

  getPoleSouthMap(): Promise<JsonValue> {
    return fetchUpstream<JsonValue>(this._httpService, SERVICES_SWPC.POLE_SOUTH);
  }

  get27DaysForecast(): Promise<string> {
    return this._fetchTransformed(SERVICES_SWPC.TWENTY_SEVEN_DAYS, readNoaaText);
  }

  private async _loadOvationCoordinates(): Promise<OvationPoint[]> {
    const cached = await this._cacheService.get<OvationPoint[]>('ovationFullForNowcast');
    if (cached !== undefined) return cached;
    if (this._ovationInFlight !== undefined) return this._ovationInFlight;

    this._ovationInFlight = this._fetchOvationCoordinates();
    try {
      return await this._ovationInFlight;
    } finally {
      this._ovationInFlight = undefined;
    }
  }

  private async _fetchOvationCoordinates(): Promise<OvationPoint[]> {
    const coordinates = await this._fetchTransformed(SERVICES_SWPC.OVATION_MAP, readOvationCoordinates);
    await Promise.all([
      this._cacheService.set('ovationFullForNowcast', coordinates, this._ttl),
      this._cacheService.set('ovationMapCache', mapOvationCoordinates(coordinates), this._ttl),
    ]);
    return coordinates;
  }

  private async _fetchTransformed<T>(url: string, transform: (data: unknown) => T): Promise<T> {
    const data = await fetchUpstream<unknown>(this._httpService, url);
    try {
      return transform(data);
    } catch (err: unknown) {
      if (err instanceof InvalidNoaaPayloadError) throw new BadGatewayException(err.message, { cause: err });
      throw err;
    }
  }
}
