import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'deviceRegistered',
})
export class NotificationsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column()
  deviceUuid: string;

  @Column()
  token: string;

  @Column()
  timestamp: Date;
}
