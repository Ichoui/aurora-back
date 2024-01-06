import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'cities',
})
export class CityEntity extends BaseEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column()
  name: string;

  @Column()
  countryCode: string;

  @Column()
  lat: string;

  @Column()
  long: string;


}
