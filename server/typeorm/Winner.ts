import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Winner {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category_id: number;

  @Column()
  nomination_id: number;

  @Column('timestamptz')
  declared: Date;

  @Column()
  year: number;

}
