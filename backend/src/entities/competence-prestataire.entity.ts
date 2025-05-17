import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';
import { Competence } from './competence.entity';
import { Service } from './service.entity';

@Entity('competencesprestataires')
export class CompetencePrestataire {
  @PrimaryGeneratedColumn({ name: 'id_competence_prestataire' })
  id: number;

  @Column({ name: 'id_utilisateur' })
  idUtilisateur: number;

  @Column({ name: 'id_competence' })
  idCompetence: number;

  @Column({ name: 'details_auto_evaluation', type: 'text', nullable: true })
  detailsAutoEvaluation: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(
    () => Utilisateur,
    (utilisateur) => utilisateur.competencesPrestataire,
  )
  @JoinColumn({ name: 'id_utilisateur' })
  utilisateur: Utilisateur;

  @ManyToOne(
    () => Competence,
    (competence) => competence.competencesPrestataire,
  )
  @JoinColumn({ name: 'id_competence' })
  competence: Competence;

  @OneToMany(() => Service, (service) => service.competencePrestataire)
  services: Service[];
}
