import { Transform } from 'class-transformer';
import { IsISO8601, IsNumber, Matches, Max, Min, ValidateIf } from 'class-validator';
import { toNumber } from '../common/number.transform';
import { normalizeSolarWindDate } from './solar-wind-date';

export class OptionalCoordinatesDto {
  @ValidateIf((_object: OptionalCoordinatesDto, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ValidateIf((_object: OptionalCoordinatesDto, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
  /** Legacy longitude alias, retained for existing mobile clients. */
  @ValidateIf((_object: OptionalCoordinatesDto, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  long?: number;
}

export class OvationQueryDto extends OptionalCoordinatesDto {}

const canonicalDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export class SolarWindQueryDto {
  @Transform(({ value }: { value: unknown }) => normalizeSolarWindDate(value))
  @Matches(canonicalDate, { message: 'firstDate must be an ISO date, a NOAA UTC timestamp or an RFC1123 GMT date' })
  @IsISO8601({ strict: true, strictSeparator: true })
  firstDate!: string;
}
