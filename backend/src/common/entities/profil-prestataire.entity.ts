import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';

@Entity('profilsprestataires')
export class ProfilPrestataire {
  @PrimaryGeneratedColumn({ name: 'id_profil_prestataire' })
  id: number;

  @Column({ name: 'id_utilisateur' })
  idUtilisateur: number;

  @Column({ name: 'biographie', nullable: true, type: 'text' })
  biographie: string;

  @Column({ name: 'annees_experience', nullable: true })
  anneesExperience: number;

  @Column({ name: 'disponibilite_generale', nullable: true })
  disponibiliteGenerale: string;

  @Column({ name: 'verifie_par_admin', default: false })
  verifieFarAdmin: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Utilisateur, (utilisateur) => utilisateur.profilPrestataire)
  @JoinColumn({ name: 'id_utilisateur' })
  utilisateur: Utilisateur;
}
