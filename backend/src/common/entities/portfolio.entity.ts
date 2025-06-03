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

export enum TypeMedia {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity('portfolio')
export class Portfolio {
  @PrimaryGeneratedColumn({ name: 'id_element_portfolio' })
  id: number;

  @Column({ name: 'id_prestataire' })
  idPrestataire: number;

  @Column({ name: 'url_media' })
  urlMedia: string;

  @Column({ name: 'type_media', type: 'enum', enum: TypeMedia })
  typeMedia: TypeMedia;

  @Column({ name: 'legende', nullable: true })
  legende: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Utilisateur, (utilisateur) => utilisateur.elementsPortfolio)
  @JoinColumn({ name: 'id_prestataire' })
  prestataire: Utilisateur;
}
