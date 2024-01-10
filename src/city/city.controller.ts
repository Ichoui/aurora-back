import { Controller, Get, HttpCode, Query, UseInterceptors } from '@nestjs/common';
import { ReqInterceptor } from '../interceptor.service';
import { CityService } from './city.service';
import { catchError, from, map, Observable } from 'rxjs';
import { City } from '../interfaces/city.interface';
import { CityEntity } from './city.entity';
import { error } from 'firebase-functions/logger';

@UseInterceptors(ReqInterceptor)
@Controller()
export class CityController {
  constructor(private readonly _cityService: CityService) {}

  /**
   * @deprecated
   * */
  @Get('/city')
  @HttpCode(200)
  getOldGeocode(@Query() params: { search: string }): Observable<City[]> {
    return from(this._cityService.parseCitiesJson$()).pipe(
      map(cities => this._cityService.oldFindCorrespondingCities$(cities, params.search)),
      catchError(err => {
        error(err);
        throw 'An error happened with OLD City api or City file !';
      }),
    );
  }

  @Get('/cities')
  @HttpCode(200)
  getGeocode(@Query() params: { search: string }): Observable<CityEntity[]> {
    return from(this._cityService.findCorrespondingCities$(params.search)).pipe(
      catchError(err => {
        error(err);
        throw 'An error happened with City api or City file !';
      }),
    );
  }

  /*// Route pour envoyer la liste de ville entière en base
  @Get('/postcities')
  @HttpCode(200)
  postCitiesToBdd(): void {
    this._cityService.postCitiesToBdd();
  }*/
}
