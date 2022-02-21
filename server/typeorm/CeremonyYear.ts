import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {GroupYear} from './GroupYear';

@Entity()
export class CeremonyYear {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ceremony_id: number;

  @Column()
  year: number;

  @Column('timestamptz')
  ceremony_date: Date;

  @Column('timestamptz')
  voting_closed: Date;

  groupYears: GroupYear[];
  nominationCount: number;
}
