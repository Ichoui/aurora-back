import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { City } from '../interfaces/city.interface';

export interface CitySearchResult {
  id: number;
  name: string;
  countryCode: string;
  lat: string;
  long: string;
}

interface CityCatalog {
  cities: City[];
  names: string[];
  prefixes: Map<string, number[]>;
}

const transliterations: Readonly<Record<string, string>> = {
  Æ: 'AE',
  æ: 'ae',
  Œ: 'OE',
  œ: 'oe',
  Ø: 'O',
  ø: 'o',
  Ł: 'L',
  ł: 'l',
  Đ: 'D',
  đ: 'd',
  Ð: 'D',
  ð: 'd',
  Þ: 'TH',
  þ: 'th',
  ß: 'ss',
  ẞ: 'SS',
};

function normalizeName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[ÆæŒœØøŁłĐđÐðÞþßẞ]/g, letter => transliterations[letter] ?? letter)
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function isCity(value: unknown): value is City {
  return (
    typeof value === 'object' &&
    value !== null &&
    ['name', 'lat', 'lng', 'country', 'admin1', 'admin2'].every(field => typeof (value as Record<string, unknown>)[field] === 'string')
  );
}

@Injectable()
export class CityService {
  private _catalog?: Promise<CityCatalog>;

  async findCorrespondingCities(search = ''): Promise<CitySearchResult[]> {
    const term = search.trim();
    if (term.length < 3) return [];

    const normalizedTerm = normalizeName(term);
    const catalog = await this.loadCatalog();
    const matches: CitySearchResult[] = [];
    for (const index of catalog.prefixes.get(normalizedTerm.slice(0, 3)) ?? []) {
      if (!catalog.names[index]?.startsWith(normalizedTerm)) continue;
      const city = catalog.cities[index];
      if (!city) continue;
      matches.push({ id: index + 1, name: city.name, countryCode: city.country, lat: city.lat, long: city.lng });
    }
    return matches;
  }

  /** @deprecated Retained for mobile clients using /city. */
  async findLegacyCities(search = ''): Promise<City[] | null> {
    const term = search.trim();
    if (term.length < 3) return null;

    const normalizedTerm = normalizeName(term);
    const catalog = await this.loadCatalog();
    return catalog.cities.filter((_, index) => catalog.names[index]?.includes(normalizedTerm));
  }

  private loadCatalog(): Promise<CityCatalog> {
    return (this._catalog ??= this.readCatalog().catch(error => {
      this._catalog = undefined;
      throw error;
    }));
  }

  private async readCatalog(): Promise<CityCatalog> {
    const contents = await readFile(join(__dirname, 'cities.json'), 'utf8');
    const parsed: unknown = JSON.parse(contents);
    if (!Array.isArray(parsed) || !parsed.every(isCity)) {
      throw new Error('Invalid city data');
    }

    const cities: City[] = parsed;
    const names: string[] = [];
    const prefixes = new Map<string, number[]>();
    for (const [index, city] of cities.entries()) {
      const name = normalizeName(city.name);
      names.push(name);
      const prefix = name.slice(0, 3);
      const indexes = prefixes.get(prefix) ?? [];
      indexes.push(index);
      prefixes.set(prefix, indexes);
    }
    return { cities, names, prefixes };
  }
}
