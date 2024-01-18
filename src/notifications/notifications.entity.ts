import { BaseEntity, Column, Entity, IsNull, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: true })
  locale: string; // en / fr

  @Column()
  timestamp: Date;
}
