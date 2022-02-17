import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Person {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  middle_name: string;

  @Column()
  role: string;

  @Column()
  email: string;

  @Column()
  odds_filter: string;

}
