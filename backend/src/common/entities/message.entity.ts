import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Utilisateur } from './utilisateur.entity';

@Entity('Messages')
export class Message {
  @PrimaryGeneratedColumn({ name: 'id_message' })
  id: number;

  @Column({ name: 'id_reservation' })
  idReservation: number;

  @Column({ name: 'id_expediteur' })
  idExpediteur: number;

  @Column({ name: 'id_destinataire' })
  idDestinataire: number;

  @Column({ name: 'contenu', type: 'text' })
  contenu: string;

  @Column({
    name: 'envoye_le_utc',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  envoyeLeUtc: Date;

  @Column({ name: 'est_lu', default: false })
  estLu: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Reservation, (reservation) => reservation.messages)
  @JoinColumn({ name: 'id_reservation' })
  reservation: Reservation;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.messagesEnvoyes)
  @JoinColumn({ name: 'id_expediteur' })
  expediteur: Utilisateur;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.messagesRecus)
  @JoinColumn({ name: 'id_destinataire' })
  destinataire: Utilisateur;
}
