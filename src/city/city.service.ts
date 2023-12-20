import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { City } from '../interfaces/city.interface';

@Injectable()
export class CityService {
  constructor() {}

  findCorrespondingCities$(cities: City[], search: string): City[] {
    if (search?.length > 2) {
      console.log(this._removeAccents(search));
      const searchFormatted = this._removeAccents(search).toLowerCase();
      return cities.filter(c => this._removeAccents(c.name).toLowerCase().includes(searchFormatted));
    }
    return null;
  }

  parseCitiesJson$(): Observable<City[]> {
    try {
      const filePath = path.join(process.cwd(), './src/city/cities.json');
      const configFIle = fs.readFileSync(filePath, 'utf-8').toString();
      // @ts-ignore
      return of(JSON.parse(configFIle));
    } catch (err) {}
  }

  private _removeAccents(strAccent: string): string {
    const strAccentsSplitted = strAccent.split('');

    let strAccentsOut = [];
    let strAccentsLen: number = strAccentsSplitted.length;
    const accents: string = 'ÀÁÂÃÄÅÆàáâãäåæßẞÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    const accentsOut: string[] = [
      'A',
      'A',
      'A',
      'A',
      'A',
      'A',
      'AE',
      'a',
      'a',
      'a',
      'a',
      'a',
      'a',
      'ae',
      'ss',
      'SS',
      'O',
      'O',
      'O',
      'O',
      'O',
      'O',
      'O',
      'o',
      'o',
      'o',
      'o',
      'o',
      'o',
      'E',
      'E',
      'E',
      'E',
      'e',
      'e',
      'e',
      'e',
      'e',
      'C',
      'c',
      'D',
      'I',
      'I',
      'I',
      'I',
      'i',
      'i',
      'i',
      'i',
      'U',
      'U',
      'U',
      'U',
      'u',
      'u',
      'u',
      'u',
      'N',
      'n',
      'S',
      's',
      'Y',
      'y',
      'y',
      'Z',
      'z',
    ];
    for (let y = 0; y < strAccentsLen; y++) {
      if (accents.indexOf(strAccentsSplitted[y]) != -1) {
        strAccentsOut[y] = accentsOut[accents.indexOf(strAccentsSplitted[y])];
      } else strAccentsOut[y] = strAccentsSplitted[y];
    }
    return strAccentsOut.join('');
  }
}
