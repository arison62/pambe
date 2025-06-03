import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CompetencePrestataire } from './competence-prestataire.entity';

@Entity('competences')
export class Competence {
  @PrimaryGeneratedColumn({ name: 'id_competence' })
  id: number;

  @Column({ name: 'nom', unique: true })
  nom: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'est_active', default: true })
  estActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(
    () => CompetencePrestataire,
    (competencePrestataire) => competencePrestataire.competence,
  )
  competencesPrestataire: CompetencePrestataire[];
}
