import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map, Observable } from 'rxjs';
import { SERVICES_SWPC, SWPC } from './swpc.model';
import { Cache } from 'cache-manager';

@Injectable()
export class AuroraService {
  private readonly _ttl = 60000 * 30; // 30 minutes, in millisecond
  constructor(
    private readonly _httpService: HttpService,
    @Inject(CACHE_MANAGER) private _cacheService: Cache,
  ) {}

  auroraPath$(): string {
    return 'Hello Aurora Chasers!';
  }

  async getAllSwpcDatas$(coords: { lat: number; lng: number }): Promise<{
    forecastSolarCycle: any;
    forecastSolarWind: any;
    forecastKp: any;
    forecastTwentySevenDays: any;
    instantKp: any;
  }> {
    const forecastSolarCycle$ = this._httpService
      .get(SERVICES_SWPC.FORECAST_SOLARCYCLE)
      .pipe(map(r => this._dataTreatment(r.data, SWPC.FORECAST_SOLARCYCLE)));
    const forecastSolarWind$ = this._httpService
      .get(SERVICES_SWPC.FORECAST_SOLARWIND_1H)
      .pipe(map(r => this._dataTreatment(r.data, SWPC.FORECAST_SOLARWIND_1H)));
    const forecastKp$ = this._httpService //
      .get(SERVICES_SWPC.FORECAST_KP)
      .pipe(map(r => this._dataTreatment(r.data, SWPC.FORECAST_KP)));
    const forecastTwentySevenDays$ = this._httpService
      .get(SERVICES_SWPC.TWENTY_SEVEN_DAYS)
      .pipe(map(r => this._dataTreatment(r.data, SWPC.TWENTY_SEVEN_DAYS)));
    const instantKp$ = this._httpService //
      .get(SERVICES_SWPC.INSTANT_KP)
      .pipe(map(r => this._dataTreatment(r.data, SWPC.INSTANT_KP)));

    let result0 = await Promise.all([
      firstValueFrom(forecastSolarCycle$),
      firstValueFrom(forecastSolarWind$),
      firstValueFrom(forecastKp$),
      firstValueFrom(forecastTwentySevenDays$),
      firstValueFrom(instantKp$),
    ]);
    const [forecastSolarCycle, forecastSolarWind, forecastKp, forecastTwentySevenDays, instantKp] = result0;
    return {
      forecastSolarCycle,
      forecastSolarWind,
      forecastKp,
      forecastTwentySevenDays,
      instantKp,
    };
  }

  getOneSwpcData$(url: string, swpcType: SWPC, body?: Record<string, unknown>): Observable<Promise<any>> {
    return this._httpService.get(url).pipe(map(r => this._dataTreatment(r.data, swpcType, body)));
  }

  /**
   * @param data any data from API
   * @param swpcType type of swpc
   * @param body
   * @return data formatted for front end
   */
  private async _dataTreatment(data: unknown, swpcType?: SWPC, body?: any): Promise<any> {
    switch (swpcType) {
      case SWPC.OVATION_MAP:
        const ovationMapCached = await this._cacheService.get('ovationMapCache');

        if (ovationMapCached && !(body['long'] && body['lat'])) {
          return ovationMapCached;
        }

        const mappedCoords = [];
        let lengthCoords = data['coordinates'].length;
        let nowcast = null;
        while (--lengthCoords) {
          let long = data['coordinates'][lengthCoords][0];
          const lat = data['coordinates'][lengthCoords][1];
          const nowcastAurora = data['coordinates'][lengthCoords][2];
          if (long > 180) {
            // Longitude 180+ dépasse de la map à droite, cela permet de revenir tout à gauche de la carte
            long = long - 360;
          }
          // On prend les valeurs paires seulement, et on leur rajoute +2 pour compenser les "trous" causés par l'impair
          // On passe ainsi d'environ 7500 à 1900 valeurs dans le tableau (indication de taille récupérée)
          if (lat >= 30 || lat <= -30) {
            if (nowcastAurora >= 2 && long % 2 === 0 && lat % 2 === 0) {
              // coords avec long soustrait pour couvrir -180 à 180 de longitude
              mappedCoords.push([long, lat, nowcastAurora]);
            }
          }

          // Récupère le nowcast de l'utilisateur via ses long/lat ; Effectuer la recherche sur TOUT le tableau d'ovation
          if (long === Math.round(body['long']) && lat === Math.round(body['lat'])) {
            nowcast = nowcastAurora;
          }
        }
        await this._cacheService.set('ovationFullForNowcast', data['coordinates'], this._ttl);
        await this._cacheService.set('ovationMapCache', mappedCoords, this._ttl);

        if (body['long'] && body['lat']) {
          // Retourner nowcast quand présence de params long & lat sur la page 2
          return nowcast;
        } else {
          return mappedCoords;
        }
      case SWPC.FORECAST_SOLARCYCLE:
        let lengthSolar = (data as unknown[]).length;
        const solarData = [];
        while (--lengthSolar) {
          const d = (data as unknown[])[lengthSolar];
          if (lengthSolar % 2 === 0) {
            solarData.push({
              timeTag: d['time-tag'],
              predictedSsn: d['predicted_ssn'],
              predictedSolarFlux: d['predicted_f10.7'],
            });
          }
        }
        return solarData.reverse();
      case SWPC.INSTANT_NOWCAST:
        return {
          nowcast: await this._getNowcastAurora(body['lng'], body['lat']),
        };
      case SWPC.FORECAST_SOLARWIND_1H:
        const keyFromFirstIndexValue1h = Object.values(data[0]);
        let solarWind1h: unknown[] = [];
        for (const value of Object.values(data)) {
          // Associe un tableau de clef à un tableau de valeurs à chaque itération et l'ajoute à un tableau
          solarWind1h.push(
            keyFromFirstIndexValue1h.reduce((acc, key, index) => {
              let val = value[index];
              if (key === 'temperature' || key === 'bx' || key === 'by' || key === 'vx' || key === 'vy' || key === 'vz') {
                // @ts-ignore / values are not used
                return { ...acc };
              }

              if (key !== 'propagated_time_tag' && key !== 'time_tag' && key !== 'temperature') {
                // Transforme certaine valeur en Integer
                // Si value n'existe pas (null), on retourne null (bt bz)
                val = val ? parseFloat(value[index]) : value[index];
              }
              // @ts-ignore
              return { ...acc, [key]: val };
            }, {}),
          );
        }
        solarWind1h.shift(); // Removing first index with keys
        return solarWind1h;
      case SWPC.FORECAST_SOLARWIND_7D:
        const keyFromFirstIndexValue7d = Object.values(data[0]);
        let solarWind7d: unknown[] = [];

        const firstDate = new Date(body.date['firstDate']).toUTCString();
        const findMinIndex = Object.values(data).findIndex((e, i) => new Date(e[0]).toUTCString() === firstDate); // trouver l'horaire mini et son index minimum dans le tableau et garder tout les index supérieur
        for (let i = 0; i < Object.values(data).length; i++) {
          if (i >= findMinIndex) {
            const value = Object.values(data)[i];
            if (new Date(value[0]).getMinutes() % 5 === 0) {
              // Associe un tableau de clef à un tableau de valeurs à chaque itération et l'ajoute à un tableau
              solarWind7d.push(
                keyFromFirstIndexValue7d.reduce((acc, key, index) => {
                  let val = value[index];
                  if (key !== 'speed' && key !== 'time_tag') {
                    // @ts-ignore / values are not used
                    return { ...acc };
                  }
                  // @ts-ignore
                  return { ...acc, [key]: val };
                }, {}),
              );
            }
          }
        }
        solarWind7d.shift(); // Removing first index with keys
        return solarWind7d;
      case SWPC.FORECAST_KP:
        const keyFromFirstIndexValueKp = Object.values(data[0]);
        let forecastKp: unknown[] = [];
        for (const value of Object.values(data)) {
          // Associe un tableau de clef à un tableau de valeurs à chaque itération et l'ajoute à un tableau
          forecastKp.push(
            keyFromFirstIndexValueKp.reduce((acc, key, index) => {
              let val = value[index];
              if (key === 'noaa_scale') {
                // @ts-ignore / noaa_scale is not used ; only predicted value are displayed
                return { ...acc };
              }
              if (key === 'kp') {
                // Si value n'existe pas (null), on retourne null (bt bz)
                val = parseFloat(value[index]);
              }

              // @ts-ignore
              return { ...acc, [key]: val };
            }, {}),
          );
        }
        forecastKp.shift(); // Removing first index with keys
        return forecastKp.filter(f => f['observed'] !== 'observed').map(f => ({ kpIndex: f['kp'], timeTag: f['time_tag'] }));
      case SWPC.INSTANT_KP:
        return data[(data as unknown[]).length - 1];
      default:
        return data;
    }
  }

  private async _getNowcastAurora(long: number, lat: number): Promise<number> {
    const coords = (await this._cacheService.get('ovationFullForNowcast')) as unknown[];
    if (!coords) {
      return null;
    }
    let length = coords.length; // tab index to decrement
    /*[long, lat, aurora]*/
    while (--length) {
      if (coords[length][0] > 180) {
        // Longitude 180+ dépasse de la map à droite, cela permet de revenir tout à gauche de la carte
        coords[length][0] = coords[length][0] - 360;
      }
      if (coords[length][0] === Math.round(long) && coords[length][1] === Math.round(lat)) {
        return coords[length][2];
      }
    }
  }
}
