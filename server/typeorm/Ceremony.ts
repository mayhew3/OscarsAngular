import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Ceremony {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

}
