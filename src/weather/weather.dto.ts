import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { toNumber } from '../common/number.transform';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenWeatherCoordinatesDto {
  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-90)
  @Max(90)
  lat!: number;

  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-180)
  @Max(180)
  lon!: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  appid?: string;
}

export class WeatherQueryDto extends OpenWeatherCoordinatesDto {
  @IsOptional()
  @IsIn(['standard', 'metric', 'imperial'])
  units?: 'standard' | 'metric' | 'imperial';

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lang?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  exclude?: string;
}

export class GeocodeQueryDto extends OpenWeatherCoordinatesDto {
  @ApiPropertyOptional({ type: 'integer', minimum: 1 })
  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
