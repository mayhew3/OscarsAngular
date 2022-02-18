import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {CeremonyYear} from './CeremonyYear';

@Entity()
export class Ceremony {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  ceremonyYears: CeremonyYear[];
}
