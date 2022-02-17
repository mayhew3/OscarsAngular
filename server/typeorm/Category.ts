import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Category {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  points: number;

  @Column()
  start_year: number;

  @Column()
  end_year: number;

  @Column()
  ceremony_id: number;

  @Column()
  sub_name: string;

}
