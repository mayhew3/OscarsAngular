import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class PersonGroupRole {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  person_group_id: number;

  @Column()
  person_id: number;

}
