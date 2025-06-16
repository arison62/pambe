import { Module } from '@nestjs/common';
import { ProfilPrestataireService } from './profil-prestataire.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilPrestataire } from 'src/common/entities/profil-prestataire.entity';
import { Utilisateur } from 'src/common/entities/utilisateur.entity';
import { ProfilPrestataireController } from './profil-prestataire.controller';
import { UtilisateursModule } from 'src/utilisateurs/utilisateurs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfilPrestataire, Utilisateur]),
    UtilisateursModule,
  ],
  providers: [ProfilPrestataireService],
  controllers: [ProfilPrestataireController],
  exports: [ProfilPrestataireService],
})
export class ProfilPrestataireModule {}
