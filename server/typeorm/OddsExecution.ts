import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {OddsResult} from './OddsResult';

@Entity()
export class OddsExecution {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number;

  @Column('timestamptz')
  time_finished: Date;

  @Column()
  year: number;

  // non-db fields
  odds: OddsResult[];

}
