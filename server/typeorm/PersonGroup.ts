import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class PersonGroup {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  nickname: string;

}
