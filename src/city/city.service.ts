import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { CityEntity } from './city.entity';
import { Repository } from 'typeorm';
import { City } from '../interfaces/city.interface';
import * as path from 'path';

@Injectable()
export class CityService {
  constructor(
    @Inject(CACHE_MANAGER) private _cacheService: Cache,
    @InjectRepository(CityEntity) private _cityEntityResository: Repository<CityEntity>,
  ) {}
  private readonly _ttl = 60000 * 120; // 120 minutes, in millisecond

  async findCorrespondingCities$(search: string): Promise<CityEntity[]> {
    if (search?.length > 2) {
      // CREATE EXTENSION IF NOT EXISTS unaccent; //Ajouter cette ligne directement sur la base de donnée pour rajouter l'extension "unaccent" à la bdd
      const query = await this._cityEntityResository
        .createQueryBuilder('c')
        .where("LOWER(UNACCENT(c.name)) ILIKE LOWER(UNACCENT(:name)) || '%'", { name: search.trim() })
        .getMany();
      if (!query) {
        throw new NotFoundException('Ville introuvable !');
      }
      return query;
    }
  }

  /* postCitiesToBdd(): void {
    // Ajouter les lignes suivantes dans nest-cli.json sous le compiler, pour pouvoir rajouter le fichier files dans le build
    //     "assets": [     {
    //       "include": "/files",
    //       "outDir": "dist/",
    //       "watchAssets": true
    //     }
    //     ],
    //     "watchAssets": true
    fs.promises
      .readFile('dist/files/cities.json', 'utf-8')
      .then(e => JSON.parse(e))
      .then(async (filenames: CityDto[]) => {
        for (let i = 0; i < filenames.length; i++) {
          const entity = this._cityEntityResository.create({
            // nameFormatted: this._removeAccents(filenames[i].name).toLowerCase(),
            name: filenames[i].name,
            lat: filenames[i].lat,
            long: filenames[i].lng,
            countryCode: filenames[i].country,
          });

          if (!entity) {
            console.error('Impossible ajouter ville ' + filenames[i].name);
          }
          await this._cityEntityResository.save(entity);
        }
      });
  }*/
}
