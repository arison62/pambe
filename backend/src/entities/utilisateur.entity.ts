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
import { Ville } from './ville.entity';
import { Quartier } from './quartier.entity';
import { ProfilPrestataire } from './profil-prestataire.entity';
import { CompetencePrestataire } from './competence-prestataire.entity';
import { Service } from './service.entity';
import { Reservation } from './reservation.entity';
import { Message } from './message.entity';
import { Portfolio } from './portfolio.entity';
import { JetonAuthentification } from './jeton-authentification.entity';
import { Transaction } from './transaction.entity';

export enum TypeRole {
  CLIENT = 'CLIENT',
  PRESTATAIRE = 'PRESTATAIRE',
  ADMIN = 'ADMIN',
}

export enum MethodeAuth {
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  APPLE = 'APPLE',
}

@Entity('utilisateurs')
export class Utilisateur {
  @PrimaryGeneratedColumn({ name: 'id_utilisateur' })
  id: number;

  @Column({ name: 'numero_telephone', unique: true, nullable: true })
  numeroTelephone: string;

  @Column({ name: 'email', unique: true, nullable: true })
  email: string;

  @Column({ name: 'hash_mot_de_passe', nullable: true })
  hashMotDePasse: string;

  @Column({ name: 'nom_complet' })
  nomComplet: string;

  @Column({ name: 'id_ville', nullable: true })
  idVille: number;

  @Column({ name: 'id_quartier', nullable: true })
  idQuartier: number;

  @Column({ name: 'url_photo_profil', nullable: true })
  urlPhotoProfil: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: TypeRole,
    default: TypeRole.CLIENT,
  })
  role: TypeRole;

  @Column({ name: 'telephone_verifie', default: false })
  telephoneVerifie: boolean;

  @Column({ name: 'email_verifie', default: false })
  emailVerifie: boolean;

  @Column({ name: 'est_actif', default: true })
  estActif: boolean;

  @Column({
    name: 'methode_authentification',
    type: 'enum',
    enum: MethodeAuth,
    default: MethodeAuth.EMAIL_PASSWORD,
  })
  methodeAuth: MethodeAuth;

  @Column({ name: 'id_externe_auth', nullable: true })
  idExterneAuth: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Ville, (ville) => ville.utilisateurs)
  @JoinColumn({ name: 'id_ville' })
  ville: Ville;

  @ManyToOne(() => Quartier, (quartier) => quartier.utilisateurs)
  @JoinColumn({ name: 'id_quartier' })
  quartier: Quartier;

  @OneToOne(() => ProfilPrestataire, (profil) => profil.utilisateur)
  profilPrestataire: ProfilPrestataire;

  @OneToMany(
    () => CompetencePrestataire,
    (competence) => competence.utilisateur,
  )
  competencesPrestataire: CompetencePrestataire[];

  @OneToMany(() => Service, (service) => service.prestataire)
  services: Service[];

  @OneToMany(() => Reservation, (reservation) => reservation.client)
  reservationsClient: Reservation[];

  @OneToMany(() => Reservation, (reservation) => reservation.prestataire)
  reservationsPrestataire: Reservation[];

  @OneToMany(() => Message, (message) => message.expediteur)
  messagesEnvoyes: Message[];

  @OneToMany(() => Message, (message) => message.destinataire)
  messagesRecus: Message[];

  @OneToMany(() => Portfolio, (portfolio) => portfolio.prestataire)
  elementsPortfolio: Portfolio[];

  @OneToMany(() => JetonAuthentification, (jeton) => jeton.utilisateur)
  jetonsAuthentification: JetonAuthentification[];

  @OneToMany(() => Transaction, (transaction) => transaction.payeur)
  transactionsPayeur: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.beneficiaire)
  transactionsBeneficiaire: Transaction[];
}
