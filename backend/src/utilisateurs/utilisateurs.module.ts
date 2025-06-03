import { Module } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';
import { UtilisateursController } from './utilisateurs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utilisateur } from '../common/entities/utilisateur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Utilisateur])],
  providers: [UtilisateursService],
  controllers: [UtilisateursController],
  exports: [UtilisateursService],
})
export class UtilisateursModule {}
