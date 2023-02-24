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
    switch (swpcType) {
      case SWPC.OVATION_MAP:
        const ovationMapCached = await this._cacheService.get(
          'ovationMapCache',
        );
        if (ovationMapCached) {
          return ovationMapCached;
        }
        const mappedCoords = [];
        // TOdo PERFORMANCE OPTIMISER FOREACH OR FOR ... OF A VERIFIER
        for (const coords of data['coordinates']) {
          let long = coords[0];
          const lat = coords[1];
          const nowcastAurora = coords[2];
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
        // PERFORMANCE MAP
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
    const ovationMapCache = (await this._cacheService.get(
      'ovationFullForNowcast',
    )) as unknown[];
    if (!ovationMapCache) {
      return null;
    }
    /*[long, lat, aurora]*/
    // Todo OTPIMISER
    for (let coords of ovationMapCache) {
      if (coords[0] === Math.round(long) && coords[1] === Math.round(lat)) {
        console.log(coords);
        return coords[2];
      }
    }
  }
}
