import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Utilisateur } from './utilisateur.entity';

export enum StatutTransaction {
  EN_ATTENTE = 'EN_ATTENTE',
  REUSSIE = 'REUSSIE',
  ECHOUEE = 'ECHOUEE',
  REMBOURSEE = 'REMBOURSEE',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ name: 'id_transaction' })
  id: number;

  @Column({ name: 'id_reservation' })
  idReservation: number;

  @Column({ name: 'id_payeur' })
  idPayeur: number;

  @Column({ name: 'id_beneficiaire' })
  idBeneficiaire: number;

  @Column({ name: 'montant_total', type: 'decimal', precision: 12, scale: 2 })
  montantTotal: number;

  @Column({
    name: 'pourcentage_commission_plateforme',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  pourcentageCommissionPlateforme: number;

  @Column({
    name: 'montant_frais_plateforme',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  montantFraisPlateforme: number;

  @Column({
    name: 'montant_verse_prestataire',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  montantVersePrestataire: number;

  @Column({ name: 'methode_paiement_utilisee', length: 50 })
  methodePaiementUtilisee: string;

  @Column({
    name: 'id_reference_passerelle_paiement',
    unique: true,
    nullable: true,
  })
  idReferencePasserellePaiement: string;

  @Column({ name: 'statut', type: 'enum', enum: StatutTransaction })
  statut: StatutTransaction;

  @Column({
    name: 'date_transaction_utc',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateTransactionUtc: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Reservation, (reservation) => reservation.transactions)
  @JoinColumn({ name: 'id_reservation' })
  reservation: Reservation;

  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.transactionsPayeur)
  @JoinColumn({ name: 'id_payeur' })
  payeur: Utilisateur;

  @ManyToOne(
    () => Utilisateur,
    (utilisateur) => utilisateur.transactionsBeneficiaire,
  )
  @JoinColumn({ name: 'id_beneficiaire' })
  beneficiaire: Utilisateur;
}
