import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Vote {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category_id: number;

  @Column()
  nomination_id: number;

  @Column()
  person_id: number;

  @Column()
  year: number;

  @Column('timestamptz')
  date_added: Date;

}
