import { Module } from '@nestjs/common';
import { ServiceCompetenceService } from './service-competence.service';
import { ServiceCompetenceController } from './service-competence.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from 'src/common/entities/service.entity';
import { Competence } from 'src/common/entities/competence.entity';
import { CompetencePrestataire } from 'src/common/entities/competence-prestataire.entity';
import { ProfilPrestataireModule } from 'src/profil-prestataire/profil-prestataire.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Competence, CompetencePrestataire]),
    ProfilPrestataireModule,
  ],
  providers: [ServiceCompetenceService],
  controllers: [ServiceCompetenceController],
})
export class ServiceCompetenceModule {}
