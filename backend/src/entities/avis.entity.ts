import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('avis')
export class Avis {
  @PrimaryGeneratedColumn({ name: 'id_avis' })
  id: number;

  @Column({ name: 'id_reservation', unique: true })
  idReservation: number;

  @Column({ name: 'id_client' })
  idClient: number;

  @Column({ name: 'id_prestataire' })
  idPrestataire: number;

  @Column({ name: 'notation_etoiles' })
  notationEtoiles: number;

  @Column({ name: 'commentaire', type: 'text', nullable: true })
  commentaire: string;

  @Column({ name: 'reponse_prestataire', type: 'text', nullable: true })
  reponsePrestataire: string;

  @Column({
    name: 'date_avis_utc',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateAvisUtc: Date;

  @Column({ name: 'cache_par_moderation', default: false })
  cacheParModeration: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Reservation, (reservation) => reservation.avis)
  @JoinColumn({ name: 'id_reservation' })
  reservation: Reservation;

  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'id_client' })
  client: Utilisateur;

  @ManyToOne(() => Utilisateur)
  @JoinColumn({ name: 'id_prestataire' })
  prestataire: Utilisateur;
}
