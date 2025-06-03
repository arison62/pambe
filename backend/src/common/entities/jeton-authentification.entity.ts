import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';

@Entity('jetonsauthentification')
export class JetonAuthentification {
  @PrimaryGeneratedColumn({ name: 'id_jeton' })
  id: number;

  @Column({ name: 'id_utilisateur' })
  idUtilisateur: number;

  @Column({ name: 'jeton' })
  jeton: string;

  @Column({ name: 'type_jeton' })
  typeJeton: string;

  @Column({ name: 'expire_le', type: 'timestamptz' })
  expireLe: Date;

  @Column({ name: 'est_actif', default: true })
  estActif: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(
    () => Utilisateur,
    (utilisateur) => utilisateur.jetonsAuthentification,
  )
  @JoinColumn({ name: 'id_utilisateur' })
  utilisateur: Utilisateur;
}
