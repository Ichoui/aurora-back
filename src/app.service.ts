import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map, Observable } from "rxjs";
import { AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  constructor(private readonly _httpService: HttpService) {}

  auroraPath(): string {
    return 'Hello Aurora Chasers!';
  }

  getSwpcData$(str: string): Observable<AxiosResponse<any>> {
    return this._httpService.get(str).pipe(map(r => r.data))
  }
}

/**
 * @param urlRequested url requested from front, without the host part
 * @param data any data from API ; nullable
 * @param body body from POST method
 */
export function dataTreatment(urlRequested, data, body) {
  switch (urlRequested) {
    case '/aurora/map/ovation':
      // const ovationMapCached = cache.get('ovationMapCache')
      const ovationMapCached = []
      if (ovationMapCached) {
        return ovationMapCached
      }
      const mappedCoords = [];
      // TOdo PERFORMANCE OPTIMISER FOREACH A VERIFIER
      data['coordinates'].forEach((coords /*[long, lat, aurora]*/) => {
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
            mappedCoords.push([long, lat, nowcastAurora])
          }
        }
      })
      // cache.set("ovationMapCache", mappedCoords, cachedTimeMapOvation)
      // cache.set("ovationFullForNowcast", data['coordinates'], cachedTimeMapOvation)
      return mappedCoords;
    case '/aurora/forecast/solarcycle':
      // PERFORMANCE MAP
      return data.map(e => ({
        timeTag: e['time-tag'],
        predictedSsn: e['predicted_ssn'],
        predictedSolarFlux: e['predicted_f10.7']
      }))
    case '/aurora/instant/nowcast':
      return {nowcast: getNowcastAurora(body['lng'], body['lat'])}
    case '/aurora/forecast/solarwind':
      // const finalData = []
      // const d = data.map((e, i) => {
      //     if (i === 0) {
      //         finalData.push(e)
      //     } else {
      //         finalData.push(e)
      //     }
      // })
      return data;
    case '/aurora/instant/kp':
      return data[data.length - 1]
    default:
      return data;
  }
}


function getNowcastAurora(long, lat) {
  try {
    // const ovationMapCache = cache.get('ovationFullForNowcast');
    const ovationMapCache = []; // a voir
    if (!ovationMapCache) {
      return null;
    }
    /*[long, lat, aurora]*/
    // Todo OTPIMISER
    for (let coords of ovationMapCache) {
      if (coords[0] === Math.round(long) && coords[1] === Math.round(lat)) {
        return coords[2]
      }
    }
  } catch (e) {
    // writeResponse(e, 404, 'Cache nowcast error')
  }
}
