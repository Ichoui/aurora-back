import type { CoordinatesDto } from '../common/coordinates.dto';
import type { JsonObject } from '../common/json.types';
import type { KpForecastPoint, OvationPoint, SolarCyclePoint } from './aurora-response.interface';
import { normalizeSolarWindDate } from './solar-wind-date';

type TableCell = string | number | boolean | null;
interface NoaaTable {
  headers: string[];
  rows: TableCell[][];
}

export class InvalidNoaaPayloadError extends Error {
  constructor() {
    super('Invalid response from NOAA SWPC');
    this.name = 'InvalidNoaaPayloadError';
  }
}

function invalidNoaaPayload(): never {
  throw new InvalidNoaaPayloadError();
}

function asArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) invalidNoaaPayload();
  return value;
}

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) invalidNoaaPayload();
  return value as Record<string, unknown>;
}

export function readNoaaText(value: unknown): string {
  if (typeof value !== 'string') invalidNoaaPayload();
  return value;
}

function asPrediction(value: unknown): string | number | null {
  if (value !== null && typeof value !== 'number' && typeof value !== 'string') invalidNoaaPayload();
  return value;
}

function asTable(data: unknown): NoaaTable {
  const values = asArray(data);
  if (values.length === 0) return { headers: [], rows: [] };
  const headers = asArray(values[0]).map(readNoaaText);
  const rows = values.slice(1).map(value =>
    asArray(value).map(cell => {
      if (cell !== null && typeof cell !== 'string' && typeof cell !== 'number' && typeof cell !== 'boolean') invalidNoaaPayload();
      return cell;
    }),
  );
  return { headers, rows };
}

function numericValue(value: TableCell | undefined): number | null {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

export function readOvationCoordinates(data: unknown): OvationPoint[] {
  return asArray(asObject(data).coordinates).map(value => {
    const point = asArray(value);
    if (point.length < 3 || !point.slice(0, 3).every(entry => typeof entry === 'number' && Number.isFinite(entry))) invalidNoaaPayload();
    return [point[0], point[1], point[2]] as OvationPoint;
  });
}

export function mapOvationCoordinates(coordinates: readonly OvationPoint[]): OvationPoint[] {
  const mapped: OvationPoint[] = [];
  for (let index = coordinates.length - 1; index >= 0; index--) {
    const [longitude, latitude, probability] = coordinates[index];
    const lng = longitude > 180 ? longitude - 360 : longitude;
    if (Math.abs(latitude) >= 30 && probability >= 2 && lng % 2 === 0 && latitude % 2 === 0) mapped.push([lng, latitude, probability]);
  }
  return mapped;
}

export function findOvationProbability(coordinates: readonly OvationPoint[], coords: CoordinatesDto): number | null {
  for (let index = coordinates.length - 1; index >= 0; index--) {
    const [longitude, latitude, probability] = coordinates[index];
    const lng = longitude > 180 ? longitude - 360 : longitude;
    if (lng === Math.round(coords.lng) && latitude === Math.round(coords.lat)) return probability;
  }
  return null;
}

export function transformSolarCycle(data: unknown): SolarCyclePoint[] {
  const values = asArray(data);
  const result: SolarCyclePoint[] = [];
  // Preserve the existing thinning contract: skip index zero, keep even indices.
  for (let index = 2; index < values.length; index += 2) {
    const item = asObject(values[index]);
    result.push({
      timeTag: readNoaaText(item['time-tag']),
      predictedSsn: asPrediction(item.predicted_ssn),
      predictedSolarFlux: asPrediction(item['predicted_f10.7']),
    });
  }
  return result;
}

export function transformSolarWind1h(data: unknown): JsonObject[] {
  const { headers, rows } = asTable(data);
  const ignored = new Set(['temperature', 'bx', 'by', 'vx', 'vy', 'vz']);
  return rows.map(row => {
    const result: JsonObject = {};
    headers.forEach((key, index) => {
      const value = row[index];
      if (ignored.has(key) || value === undefined) return;
      result[key] = key === 'propagated_time_tag' || key === 'time_tag' || !value ? value : numericValue(value);
    });
    return result;
  });
}

export function transformSolarWind7d(data: unknown, firstDate: string): JsonObject[] {
  const { headers, rows } = asTable(data);
  const date = new Date(normalizeSolarWindDate(firstDate) ?? NaN).toUTCString();
  const rowDate = (row: TableCell[]): Date => new Date(normalizeSolarWindDate(row[0]) ?? NaN);
  const firstIndex = rows.findIndex(row => rowDate(row).toUTCString() === date);
  const result = rows
    .slice(Math.max(firstIndex, 0))
    .filter(row => rowDate(row).getUTCMinutes() % 5 === 0)
    .map(row => {
      const item: JsonObject = {};
      headers.forEach((key, index) => {
        const value = row[index];
        if ((key === 'speed' || key === 'time_tag') && value !== undefined) item[key] = value;
      });
      return item;
    });
  // Mobile clients currently receive samples after the first matching entry.
  return result.slice(1);
}

export function transformKpForecast(data: unknown): KpForecastPoint[] {
  const values = asArray(data);
  if (values.length === 0) return [];
  if (!Array.isArray(values[0])) {
    return values
      .map(asObject)
      .filter(item => item.observed !== 'observed')
      .map(item => {
        const kp = item.kp;
        if (kp !== undefined && kp !== null && typeof kp !== 'string' && typeof kp !== 'number') invalidNoaaPayload();
        return { kpIndex: numericValue(kp), timeTag: readNoaaText(item.time_tag) };
      });
  }

  const { headers, rows } = asTable(data);
  const observedIndex = headers.indexOf('observed');
  const kpIndex = headers.indexOf('kp');
  const dateIndex = headers.indexOf('time_tag');
  return rows
    .filter(row => row[observedIndex] !== 'observed')
    .map(row => ({ kpIndex: numericValue(row[kpIndex]), timeTag: readNoaaText(row[dateIndex]) }));
}

export function readInstantKp(data: unknown): JsonObject | null {
  const values = asArray(data);
  return values.length === 0 ? null : (asObject(values[values.length - 1]) as JsonObject);
}
