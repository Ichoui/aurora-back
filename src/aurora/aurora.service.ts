import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from 'rxjs';
import { SWPC } from './swpc.model';
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

  getSwpcData$(
    url: string,
    swpcType: SWPC,
    body?: Record<string, unknown>,
  ): Observable<Promise<any>> {
    console.log(url);
    return this._httpService
      .get(url)
      .pipe(map((r) => this._dataTreatment(r.data, swpcType, body)));
  }

  /**
   * @param data any data from API ; nullable
   * @param swpcType type of swpc
   * @param body
   * @return data formatted for front end
   */
  private async _dataTreatment(
    data: unknown,
    swpcType?: SWPC,
    body?: any,
  ): Promise<any> {
    console.log('PTNNN', data);
    switch (swpcType) {
      case SWPC.OVATION_MAP:
        const ovationMapCached = await this._cacheService.get(
          'ovationMapCache',
        );
        console.log('geee');
        console.log(ovationMapCached);
        if (ovationMapCached) {
          console.log(ovationMapCached);
          return ovationMapCached;
        }
        const mappedCoords = [];
        let length = data['coordinates'].length;
        while (--length) {
        // for (const coords of data['coordinates']) {
          let long = data['coordinates'][length][0];
          const lat = data['coordinates'][length][1];
          const nowcastAurora = data['coordinates'][length][2];
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
        }
        await this._cacheService.set(
          'ovationMapCache',
          mappedCoords,
          this._ttl,
        );
        await this._cacheService.set(
          'ovationFullForNowcast',
          data['coordinates'],
          this._ttl,
        );

        console.log(await this._cacheService.get('ovationFullForNowcast'));
        return mappedCoords;
      case SWPC.FORECAST_SOLARCYCLE:
        return (data as unknown[]).map((e) => ({
          timeTag: e['time-tag'],
          predictedSsn: e['predicted_ssn'],
          predictedSolarFlux: e['predicted_f10.7'],
        }));
      case SWPC.INSTANT_NOWCAST:
        return {
          nowcast: await this._getNowcastAurora(body['lng'], body['lat']),
        };
      case SWPC.FORECAST_SOLARWIND:
        // TODO finaliser un jour ceci
        // const finalData = []
        // const d = data.map((e, i) => {
        //     if (i === 0) {
        //         finalData.push(e)
        //     } else {
        //         finalData.push(e)
        //     }
        // })
        // console.log(data);
        return data;
      case SWPC.INSTANT_KP:
        return data[(data as unknown[]).length - 1];
      default:
        return data;
    }
  }

  private async _getNowcastAurora(long, lat): Promise<number> {
    const coords = (await this._cacheService.get(
      'ovationFullForNowcast',
    )) as unknown[];
    if (!coords) {
      return null;
    }
    let length = coords.length;
    while (--length) {
    /*[long, lat, aurora]*/
      if (coords[length][0] === Math.round(long) && coords[length][1] === Math.round(lat)) {
        console.log(coords[length]);
        return coords[length][2];
      }
    }
  }
}
