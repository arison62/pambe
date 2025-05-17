// quartier.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Ville } from './ville.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('quartiers')
export class Quartier {
  @PrimaryGeneratedColumn({ name: 'id_quartier' })
  id: number;

  @Column({ name: 'nom' })
  nom: string;

  @Column({ name: 'id_ville' })
  idVille: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Ville, (ville) => ville.quartiers)
  @JoinColumn({ name: 'id_ville' })
  ville: Ville;

  @OneToMany(() => Utilisateur, (utilisateur) => utilisateur.quartier)
  utilisateurs: Utilisateur[];
}
