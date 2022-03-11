import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class SystemVars {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  curr_year: number;

  @Column()
  voting_open: boolean;

  @Column()
  ceremony_year_id: number;

}
