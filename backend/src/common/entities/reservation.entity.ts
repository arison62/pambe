import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';
import { Service } from './service.entity';
import { Message } from './message.entity';
import { Transaction } from './transaction.entity';
import { Avis } from './avis.entity';

export enum StatutReservation {
  EN_ATTENTE_PRESTATAIRE = 'EN_ATTENTE_PRESTATAIRE',
  EN_ATTENTE_CLIENT = 'EN_ATTENTE_CLIENT',
  CONFIRMEE = 'CONFIRMEE',
  ANNULEE_PAR_CLIENT = 'ANNULEE_PAR_CLIENT',
  ANNULEE_PAR_PRESTATAIRE = 'ANNULEE_PAR_PRESTATAIRE',
  TERMINEE = 'TERMINEE',
  LITIGE = 'LITIGE',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn({ name: 'id_reservation' })
  id: number;

  @Column({ name: 'id_client' })
  idClient: number;

  @Column({ name: 'id_prestataire' })
  idPrestataire: number;

  @Column({ name: 'id_service' })
  idService: number;

  @Column({ name: 'date_heure_reservation_utc', type: 'timestamptz' })
  dateHeureReservationUtc: Date;

  @Column({ name: 'message_client', type: 'text', nullable: true })
  messageClient: string;

  @Column({ name: 'statut', type: 'enum', enum: StatutReservation })
  statut: StatutReservation;

  @Column({ name: 'raison_annulation', type: 'text', nullable: true })
  raisonAnnulation: string;

  @Column({
    name: 'prix_final_convenu',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  prixFinalConvenu: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.reservationsClient)
  @JoinColumn({ name: 'id_client' })
  client: Utilisateur;

  @ManyToOne(
    () => Utilisateur,
    (utilisateur) => utilisateur.reservationsPrestataire,
  )
  @JoinColumn({ name: 'id_prestataire' })
  prestataire: Utilisateur;

  @ManyToOne(() => Service, (service) => service.reservations)
  @JoinColumn({ name: 'id_service' })
  service: Service;

  @OneToMany(() => Message, (message) => message.reservation)
  messages: Message[];

  @OneToMany(() => Transaction, (transaction) => transaction.reservation)
  transactions: Transaction[];

  @OneToOne(() => Avis, (avis) => avis.reservation)
  avis: Avis;
}
