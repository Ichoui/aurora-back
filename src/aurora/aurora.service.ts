import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { map, Observable, of } from "rxjs";
import { AxiosResponse } from "axios";
import { SWPC } from "./swpc.model";

@Injectable()
export class AuroraService {
  constructor(private readonly _httpService: HttpService) {}

  auroraPath$(): string {
    return 'Hello Aurora Chasers!';
  }

  getSwpcData$(
    url: string,
    swpcType: SWPC,
    body?: Record<string, unknown>,
  ): Observable<AxiosResponse<any>> {
    return this._httpService
      .get(url)
      .pipe(map((r) => dataTreatment(r.data, swpcType, body)));
  }
}

/**
 * @param data any data from API ; nullable
 * @param swpcType type of swpc
 * @param body
 * @return data formatted for front end
 */
export function dataTreatment(data: unknown, swpcType?: SWPC, body?: any): any {
  switch (swpcType) {
    case SWPC.OVATION_MAP:
      // const ovationMapCached = cache.get('ovationMapCache')
      // const ovationMapCached = []
      // if (ovationMapCached) {
      //   return ovationMapCached
      // }
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
      // cache.set("ovationMapCache", mappedCoords, cachedTimeMapOvation)
      // TODO revoir cache
      // cache.set("ovationFullForNowcast", data['coordinates'], cachedTimeMapOvation)
      return mappedCoords;
    case SWPC.FORECAST_SOLARCYCLE:
      // PERFORMANCE MAP
      return (data as unknown[]).map((e) => ({
        timeTag: e['time-tag'],
        predictedSsn: e['predicted_ssn'],
        predictedSolarFlux: e['predicted_f10.7'],
      }));
    case SWPC.INSTANT_NOWCAST:
      return { nowcast: getNowcastAurora(body['lng'], body['lat']) };
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

function getNowcastAurora(long, lat): number {
  return 2;
  try {
    // const ovationMapCache = cache.get('ovationFullForNowcast');
    // TODO revoir cache
    const ovationMapCache = []; // a voir
    if (!ovationMapCache) {
      return null;
    }
    /*[long, lat, aurora]*/
    // Todo OTPIMISER
    for (let coords of ovationMapCache) {
      if (coords[0] === Math.round(long) && coords[1] === Math.round(lat)) {
        return coords[2];
      }
    }
  } catch (e) {
    // writeResponse(e, 404, 'Cache nowcast error')
  }
}
