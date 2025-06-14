import { Module } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';
import { UtilisateursController } from './utilisateurs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from '../common/entities/utilisateur.entity';
import { Ville } from 'src/common/entities/ville.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur, Ville])],
  providers: [UtilisateursService],
  controllers: [UtilisateursController],
  exports: [UtilisateursService],
})
export class UtilisateursModule {}
