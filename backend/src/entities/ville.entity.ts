import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Quartier } from './quartier.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('villes')
export class Ville {
  @PrimaryGeneratedColumn({ name: 'id_ville' })
  id: number;

  @Column({ name: 'nom', unique: true })
  nom: string;

  @Column({ name: 'code_pays', default: 'CM', length: 2 })
  codePays: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Quartier, (quartier) => quartier.ville)
  quartiers: Quartier[];

  @OneToMany(() => Utilisateur, (utilisateur) => utilisateur.ville)
  utilisateurs: Utilisateur[];
}
