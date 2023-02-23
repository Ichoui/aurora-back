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
