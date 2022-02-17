import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Nomination {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nominee: string;

  @Column()
  context: string;

  @Column()
  detail: string;

  @Column()
  year: number;

  @Column()
  odds_expert: number;

  @Column()
  odds_user: number;

  @Column()
  odds_numerator: number;

  @Column()
  odds_denominator: number;

  @Column()
  category_id: number;

}
