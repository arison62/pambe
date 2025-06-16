import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfilPrestataire } from 'src/common/entities/profil-prestataire.entity';
import { Utilisateur } from 'src/common/entities/utilisateur.entity';
import { Repository } from 'typeorm';
import InfosProfilUtilisateurDto from './dtos/infos-profil-utilisateur-dto';
import { UtilisateursService } from 'src/utilisateurs/utilisateurs.service';

@Injectable()
export class ProfilPrestataireService {
  constructor(
    @InjectRepository(Utilisateur)
    private utilisateursRepository: Repository<Utilisateur>,
    @InjectRepository(ProfilPrestataire)
    private profilPrestataireRepository: Repository<ProfilPrestataire>,
    private utilisateurService: UtilisateursService,
  ) {}

  async createProfilPrestataire(
    idUtilisateur: number,
    biographie?: string,
    anneesExperience?: number,
    disponibiliteGenerale?: string,
    verifieParAdmin: boolean = false,
  ): Promise<ProfilPrestataire | null> {
    const utilisateur = await this.utilisateursRepository.findOneBy({
      id: idUtilisateur,
    });

    if (!utilisateur) {
      return null;
    }

    const profilPrestataire = this.profilPrestataireRepository.create({
      idUtilisateur,
      biographie,
      anneesExperience,
      disponibiliteGenerale,
      verifieParAdmin,
    });

    return await this.profilPrestataireRepository.save(profilPrestataire);
  }
  async getProfilPrestataireById(
    id: number,
  ): Promise<InfosProfilUtilisateurDto | null> {
    const profil = {} as InfosProfilUtilisateurDto;
    const data = await this.profilPrestataireRepository.findOne({
      where: { id },
      relations: ['utilisateur'],
      select: {
        utilisateur: {
          id: true,
        },
      },
    });

    if (!data) {
      return null;
    }
    const utilisateur = await this.utilisateurService.find(data.utilisateur.id);

    if (!utilisateur) {
      return null;
    }
    profil.utilisateur = utilisateur;
    profil.id = data.id;
    profil.anneesExperience = data.anneesExperience;
    profil.biographie = data.biographie;
    profil.verifieParAdmin = data.verifieParAdmin;
    profil.createdAt = data.createdAt;
    profil.updatedAt = data.updatedAt;

    return profil;
  }
  async updateProfilPrestataire(
    id: number,
    biographie?: string,
    anneesExperience?: number,
    disponibiliteGenerale?: string,
    verifieParAdmin?: boolean,
  ): Promise<ProfilPrestataire | null> {
    const profilPrestataire = await this.profilPrestataireRepository.findOneBy({
      id,
    });

    if (!profilPrestataire) {
      return null;
    }

    if (biographie !== undefined) {
      profilPrestataire.biographie = biographie;
    }
    if (anneesExperience !== undefined) {
      profilPrestataire.anneesExperience = anneesExperience;
    }
    if (disponibiliteGenerale !== undefined) {
      profilPrestataire.disponibiliteGenerale = disponibiliteGenerale;
    }
    if (verifieParAdmin !== undefined) {
      profilPrestataire.verifieParAdmin = verifieParAdmin;
    }

    return await this.profilPrestataireRepository.save(profilPrestataire);
  }
  async deleteProfilPrestataire(id: number): Promise<void> {
    const profilPrestataire = await this.profilPrestataireRepository.findOneBy({
      id,
    });

    if (!profilPrestataire) {
      throw new Error("Le profil prestataire n'existe pas");
    }

    await this.profilPrestataireRepository.remove(profilPrestataire);
  }
  async getProfilPrestataireByUtilisateurId(
    idUtilisateur: number,
  ): Promise<ProfilPrestataire | null> {
    return await this.profilPrestataireRepository.findOne({
      where: { idUtilisateur },
      relations: ['utilisateur'],
    });
  }
  async getAllProfilsPrestataires(
    page = 1,
    limit = 50,
  ): Promise<{
    profils: InfosProfilUtilisateurDto[];
    total: number;
  }> {
    let profils: InfosProfilUtilisateurDto[] = [];
    const skip = (page - 1) * limit;
    const [data, total] = await this.profilPrestataireRepository.findAndCount({
      skip,
      take: limit,
      select: {
        id: true,
      },
    });
    profils = (
      await Promise.all(
        data.map((profil) => this.getProfilPrestataireById(profil.id)),
      )
    ).filter((profil): profil is InfosProfilUtilisateurDto => profil !== null);
    return {
      profils: profils,
      total,
    };
  }
}
