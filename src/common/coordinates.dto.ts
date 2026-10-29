import { Transform } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';
import { toNumber } from './number.transform';

export class CoordinatesDto {
  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  lat!: number;

  @Transform(({ value }: { value: unknown }) => toNumber(value))
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  lng!: number;
}
