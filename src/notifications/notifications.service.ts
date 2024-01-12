import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsEntity } from './notifications.entity';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly _httpService: HttpService,
    @InjectRepository(NotificationsEntity) private _notificationsEntityRepository: Repository<NotificationsEntity>,
  ) {}

  private _getAllRegistrationTokens(): string[] {
    // TODO faire requête en base qui cherche tous les tokens
    return [
      '',
    ];
  }

  async notificationsKp(): Promise<void> {
    console.log(process.env.project);
    // Gérer la langue
    const notification = {
      title: 'Aurorapp',
      body: 'allez le foot',
    };

    return await admin
      .messaging()
      .sendEachForMulticast({ notification, tokens: this._getAllRegistrationTokens() })
      .then(e => console.log(e)); // what about the return ?
  }

  /**
   * Enregistre le token d'enregistrement à FCM d'un utilisateur
   * On met à jour tout les 7j l'horodatage, sur recommandation de la doc
   * @infos : https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=fr
   * */
  async registerDevice(token: string, deviceUuid: string) {
    console.warn('tokenRegistration: ', token);
    console.warn('deviceUuid : ', deviceUuid);
    const device = await this._notificationsEntityRepository.findOneBy({ deviceUuid });
    if (!device) {
      const entity = this._notificationsEntityRepository.create({ deviceUuid, token, timestamp: new Date() });
      await this._notificationsEntityRepository.save(entity);
      return Promise.resolve(entity);
    } else {
      if (device.token === token) {
        if (this._expirationDate(7) > device.timestamp) {
          await this._notificationsEntityRepository.update(device.id, { timestamp: new Date(), token });
        }
      } else {
        await this._notificationsEntityRepository.update(device.id, { timestamp: new Date(), token });
      }
    }
    return Promise.resolve(device);
  }

  /**
   * Détection de token devenus obsolète au bout de 30 jours
   * Sur recommandation de la doc, il faut les supprimer
   * @info : https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=fr
   * */
  async detectObsoleteTokens(): Promise<void> {
    const entityList = await this._notificationsEntityRepository.find({ where: { timestamp: LessThan(this._expirationDate(30)) } });

    await this._notificationsEntityRepository.remove(entityList); // marche bien
  }

  /**
   * @args days {number} Le nombre de jour à soustraire à la date
   **/
  private _expirationDate(days: number): Date {
    const today = new Date();
    const dateLimite = new Date(today);
    dateLimite.setDate(today.getDate() - days);
    return dateLimite;
  }
}
