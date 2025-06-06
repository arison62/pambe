import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Pays } from './pays.entity';
import { Ville } from './ville.entity';

@Entity('subdivisions')
export class Subdivision {
  @PrimaryGeneratedColumn({ name: 'id_subdivision' })
  IdSubdivision: number;

  @Column({ name: 'type_subdivision' })
  typeSubdivision: string;

  @Column()
  nom: string;

  @ManyToOne(() => Pays, (pays) => pays.subdivisions)
  @JoinColumn({ name: 'code_pays' })
  pays: Pays;

  @OneToMany(() => Ville, (ville) => ville.subdivision)
  villes: Ville[];
}
