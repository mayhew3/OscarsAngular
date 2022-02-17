import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class FinalResult {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  person_id: number;

  @Column()
  group_year_id: number;

  @Column()
  score: number;

  @Column()
  correct_count: number;

  @Column()
  rank: number;

}
