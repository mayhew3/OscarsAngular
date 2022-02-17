import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Event {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  detail: string;

  @Column()
  nomination_id: number;

  @Column('timestamptz')
  event_time: Date;

  @Column()
  year: number;

}
