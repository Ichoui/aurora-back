import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CityQueryDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  search?: string;
}
