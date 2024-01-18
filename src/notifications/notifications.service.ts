import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsEntity } from './notifications.entity';
import { LessThan, Repository } from 'typeorm';
import { NotificationBodyDto } from './notifications.dto';
import { SendResponse } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly _httpService: HttpService,
    @InjectRepository(NotificationsEntity) private _notificationsEntityRepository: Repository<NotificationsEntity>,
  ) {}

  private async _getAllRegisteredDevice(locale: 'en' | 'fr'): Promise<string[]> {
    return await this._notificationsEntityRepository.find({ where: { locale } }).then(devices => devices.map(d => d.token));
  }


  /**
   * @method sendEachForMulticast() ne peut pas envoyer plus de 500 notifications par lot.
   * */
  async sendNotifications(body: { title: string; description: string }, tokens: string[]) {
    return await admin
      .messaging()
      .sendEachForMulticast({ notification: { title: body.title, body: body.description }, tokens })
      .then(e => e.responses); // what about the return ?
  }

  /**
   * Préparation des array de 500 tokens
   * Découpage des gros tableaux de tokens en FR et EN
   * */
  async prepareNotifications(body: NotificationBodyDto): Promise<SendResponse[] | void> {
    let tokensFr = await this._getAllRegisteredDevice('fr');
    let tokensEn = await this._getAllRegisteredDevice('en');
    const max_tokens = 500;
    const emptiesFr = new Array(Math.ceil(tokensFr.length / max_tokens));

    const dividedFrArr = emptiesFr.fill(null).map(i => tokensFr.splice(0, max_tokens));

    for (const tokens of dividedFrArr) {
      await this.sendNotifications(this._prepareMessage(body.topic, 'fr'), tokens);
    }

    const emptiesEn = new Array(Math.ceil(tokensEn.length / max_tokens));
    const dividedEnArr = emptiesEn.fill(null).map(i => tokensEn.splice(0, max_tokens));
    for (const tokens of dividedEnArr) {
      await this.sendNotifications(this._prepareMessage(body.topic, 'en'), tokens);
    }
  }

  private _prepareMessage(topic: 'kp', locale: 'fr' | 'en'): { title: string; description: string } {
    if (topic === 'kp') {
      switch (locale) {
        case 'fr':
          return { title: 'KP Index en augmentation', description: "L'activité solaire augmente" };
        case 'en':
        default:
          return { title: 'KP Index increasing', description: 'Solar activity increasing' };
      }
    }
  }

  /**
   * Enregistre le token d'enregistrement à FCM d'un utilisateur
   * On met à jour tout les 7j l'horodatage, sur recommandation de la doc
   * @infos : https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=fr
   * */
  async registerDevice(deviceUuid: string, token: string) {
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
   * Met à jour la locale de notification d'un utilisateur
   * */
  async registerLocale(deviceUuid: string, locale: 'FR' | 'EN') {
    console.warn('locale:  ', locale);
    console.warn('deviceUuid : ', deviceUuid);
    const device = await this._notificationsEntityRepository.findOneBy({ deviceUuid });

    const updated = await this._notificationsEntityRepository.update(device.id, { timestamp: new Date(), locale });
    console.log(updated);
    return Promise.resolve(device);
  }

  /**
   * Détection de token devenus obsolète au bout de 30 jours
   * Sur recommandation de la doc, il faut les supprimer
   * @info : https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=fr
   * */
  async detectObsoleteTokens(): Promise<void> {
    const entityList = await this._notificationsEntityRepository.find({ where: { timestamp: LessThan(this._expirationDate(30)) } });
    await this._notificationsEntityRepository.remove(entityList);
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
