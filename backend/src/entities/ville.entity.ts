import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Quartier } from './quartier.entity';
import { Utilisateur } from './utilisateur.entity';
import { Pays } from './pays.entity';
import { Subdivision } from './subdivision.entity';

@Entity('villes')
export class Ville {
  @PrimaryGeneratedColumn({ name: 'id_ville' })
  id: number;

  @Column({ name: 'nom', unique: true })
  nom: string;


  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Quartier, (quartier) => quartier.ville)
  quartiers: Quartier[];

  @ManyToOne(() => Pays, (pays) => pays.villes)
  @JoinColumn({ name: 'code_pays' })
  pays: Pays;

  @ManyToOne(() => Subdivision, (subdivision) => subdivision.villes)
  @JoinColumn({ name: 'id_subdivision' })
  subdivision: Subdivision;

  @OneToMany(() => Utilisateur, (utilisateur) => utilisateur.ville)
  utilisateurs: Utilisateur[];
}
