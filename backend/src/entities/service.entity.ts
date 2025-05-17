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
import { Utilisateur } from './utilisateur.entity';
import { CompetencePrestataire } from './competence-prestataire.entity';
import { Reservation } from './reservation.entity';

export enum TypeTarification {
  FIXE = 'FIXE',
  HORAIRE = 'HORAIRE',
  NEGOCIABLE = 'NEGOCIABLE',
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn({ name: 'id_service' })
  id: number;

  @Column({ name: 'id_prestataire' })
  idPrestataire: number;

  @Column({ name: 'id_competence_prestataire' })
  idCompetencePrestataire: number;

  @Column({ name: 'titre' })
  titre: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'type_tarification', type: 'enum', enum: TypeTarification })
  typeTarification: TypeTarification;

  @Column({ name: 'montant_prix', type: 'decimal', precision: 12, scale: 2 })
  montantPrix: number;

  @Column({
    name: 'duree_estimee_heures',
    type: 'decimal',
    precision: 4,
    scale: 1,
  })
  dureeEstimeeHeures: number;

  @Column({ name: 'disponibilite_specifique', nullable: true })
  disponibiliteSpecifique: string;

  @Column({ name: 'est_actif', default: true })
  estActif: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.services)
  @JoinColumn({ name: 'id_prestataire' })
  prestataire: Utilisateur;

  @ManyToOne(
    () => CompetencePrestataire,
    (competencePrestataire) => competencePrestataire.services,
  )
  @JoinColumn({ name: 'id_competence_prestataire' })
  competencePrestataire: CompetencePrestataire;

  @OneToMany(() => Reservation, (reservation) => reservation.service)
  reservations: Reservation[];
}
