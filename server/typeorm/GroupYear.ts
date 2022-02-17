import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class GroupYear {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  person_group_id: number;

  @Column()
  year: number;

}
