import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompetencePrestataire } from 'src/common/entities/competence-prestataire.entity';
import { Competence } from 'src/common/entities/competence.entity';
import { ProfilPrestataireService } from 'src/profil-prestataire/profil-prestataire.service';
import { Repository } from 'typeorm';

@Injectable()
export class ServiceCompetenceService {
  constructor(
    @InjectRepository(Competence)
    private competenceRepository: Repository<Competence>,
    @InjectRepository(CompetencePrestataire)
    private competencePrestataireRepository: Repository<CompetencePrestataire>,
    private profilPrestataireService: ProfilPrestataireService,
  ) {}

  async createCompetence(
    nom: string,
    description: string,
  ): Promise<Competence | null> {
    const competence = new Competence();
    competence.nom = nom;
    competence.description = description;
    return await this.competenceRepository.save(competence);
  }

  async modifyCompetence(
    id: number,
    nom?: string,
    description?: string,
  ): Promise<Competence | null> {
    const competence = await this.competenceRepository.findOneBy({ id });
    if (!competence) {
      return null;
    }

    if (nom !== undefined) {
      competence.nom = nom;
    }
    if (description !== undefined) {
      competence.description = description;
    }
    return await this.competenceRepository.save(competence);
  }

  async getCompetences(page: number, limit: number) {
    const [competences, total] = await this.competenceRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      competences,
      total,
      page,
      limit,
    };
  }

  async createCompetencePrestataire(
    idPrestataire: number,
    idCompetence: number,
  ): Promise<CompetencePrestataire | null> {
    const competencePrestataire = new CompetencePrestataire();
    competencePrestataire.idUtilisateur = idPrestataire;
    competencePrestataire.idCompetence = idCompetence;
    return await this.competencePrestataireRepository.save(
      competencePrestataire,
    );
  }

  async deleteCompetencePrestataire(
    idPrestataire: number,
    idCompetence: number,
  ) {
    await this.competencePrestataireRepository.delete({
      idUtilisateur: idPrestataire,
      idCompetence: idCompetence,
    });
  }

  async getCompetencePrestataire(idPrestataire: number) {
    const competencePrestataire =
      await this.competencePrestataireRepository.find({
        where: { idUtilisateur: idPrestataire },
        relations: ['competence'],
      });

    return competencePrestataire.map((cp) => cp.competence);
  }

  async getPrestataireByCompetence(
    idCompetence: number,
    limit: number,
    page: number,
  ) {
    const skip = (page - 1) * limit;
    const [prestataires, total] =
      await this.competencePrestataireRepository.findAndCount({
        where: { idCompetence },
        skip: skip,
        take: limit,
      });
    const data = await Promise.all(
      prestataires
        .map(async (prestataire) => {
          const profil =
            await this.profilPrestataireService.getProfilPrestataireByUtilisateurId(
              prestataire.idUtilisateur,
            );
          return profil;
        })
        .filter((profil) => profil !== null),
    );

    return {
      prestataires: data,
      total,
      page,
      limit,
    };
  }
}
