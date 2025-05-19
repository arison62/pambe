import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ville } from './ville.entity';
import { Subdivision } from './subdivision.entity';

@Entity('pays')
export class Pays {
  @PrimaryGeneratedColumn({ name: 'code_pays' })
  codePays: number;
  @Column({ length: 255 })
  nom: string;

  @OneToMany(() => Ville, (ville) => ville.pays)
  villes: Ville[];

  @OneToMany(() => Subdivision, (subdivision) => subdivision.pays)
  subdivisions: Subdivision[];
}
