import type { JsonObject } from '../common/json.types';

export type OvationPoint = [longitude: number, latitude: number, probability: number];

export interface SolarCyclePoint {
  timeTag: string;
  predictedSsn: string | number | null;
  predictedSolarFlux: string | number | null;
}

export interface KpForecastPoint {
  kpIndex: number | null;
  timeTag: string;
}

export interface NowcastResponse {
  nowcast: number | null;
}

export interface SwpcResponse {
  forecastSolarCycle: SolarCyclePoint[];
  forecastSolarWind: JsonObject[];
  forecastKp: KpForecastPoint[];
  forecastTwentySevenDays: string;
  instantKp: JsonObject | null;
}
