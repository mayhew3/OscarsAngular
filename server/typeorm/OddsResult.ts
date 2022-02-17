import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class OddsResult {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  odds: number;

  @Column()
  person_id: number;

  @Column()
  clinched: boolean;

  @Column()
  odds_execution_id: number;

}
