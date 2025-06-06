import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  MethodeAuth,
  TypeRole,
  Utilisateur,
} from 'src/common/entities/utilisateur.entity';
import { Repository } from 'typeorm';
import CreationUtilisateurDto from './dtos/creation-utilisateur.dto';
import ModificationUtilisateurDto from './dtos/modification-utilisateur-dto';
import { Ville } from 'src/common/entities/ville.entity';
import InfosUtilisateurDto from './dtos/infos-utilisateur-dto';

@Injectable()
export class UtilisateursService {
  constructor(
    @InjectRepository(Utilisateur)
    private utilisateursRepository: Repository<Utilisateur>,

    @InjectRepository(Ville)
    private villesRepository: Repository<Ville>,
  ) {}

  async createUtilisateur(utilisateurDto: CreationUtilisateurDto) {
    const alredyExistUser = await this.utilisateursRepository.findOneBy({
      email: utilisateurDto.email,
    });
    if (alredyExistUser) {
      throw new HttpException("L'Utilisateur existe deja", 403);
    }
    const user = this.utilisateursRepository.create({
      ...utilisateurDto,
      hashMotDePasse: await bcrypt.hash(utilisateurDto.motDePasse, 10),
      role: TypeRole[utilisateurDto.role as keyof typeof TypeRole],
      methodeAuth:
        MethodeAuth[utilisateurDto.methodeAuth as keyof typeof MethodeAuth],
    });
    return await this.utilisateursRepository.save(user);
  }

  async modifierUtilisateur(
    id: number,
    utilisateurDto: ModificationUtilisateurDto,
  ): Promise<InfosUtilisateurDto | null> {
    const user = await this.utilisateursRepository.findOneBy({
      id: id,
    });
    if (!user) {
      throw new NotFoundException({
        message: "L'utilisateur n'existe pas",
      });
    }
    const updatedFields = Object.fromEntries(
      Object.entries(utilisateurDto).filter(
        ([, value]) => value !== undefined && value !== null,
      ),
    );

    if (
      updatedFields.motDePasse !== undefined &&
      updatedFields.motDePasse !== null &&
      typeof updatedFields.motDePasse === 'string' &&
      updatedFields.motDePasse.length > 0
    ) {
      updatedFields.hashMotDePasse = await bcrypt.hash(
        updatedFields.motDePasse,
        10,
      );
      delete updatedFields.motDePasse;
    }

    await this.utilisateursRepository.save({
      ...user,
      ...updatedFields,
      role: TypeRole[utilisateurDto.role as keyof typeof TypeRole] ?? user.role,
      methodeAuth:
        MethodeAuth[utilisateurDto.methodeAuth as keyof typeof MethodeAuth] ??
        user.methodeAuth,
    });

    return await this.find(id);
  }

  async find(id: number): Promise<InfosUtilisateurDto | null> {
    const data = {} as InfosUtilisateurDto;
    const utilisateur = await this.utilisateursRepository.findOne({
      where: { id },
      relations: ['quartier'],
    });
    if (!utilisateur) {
      return null;
    }
    const adresse = await this.villesRepository.findOne({
      where: {
        id: utilisateur.idVille,
      },
      relations: ['subdivision', 'pays'],
      select: {
        subdivision: {
          nom: true,
          typeSubdivision: true,
        },
        pays: {
          nom: true,
        },
      },
    });
    data.id = utilisateur.id;
    data.nomComplet = utilisateur.nomComplet;
    data.email = utilisateur.email;
    data.numeroTelephone = utilisateur.numeroTelephone;
    data.urlPhotoProfil = utilisateur.urlPhotoProfil;
    data.role = utilisateur.role;
    data.telephoneVerifie = utilisateur.telephoneVerifie;
    data.emailVerifie = utilisateur.emailVerifie;
    data.estActif = utilisateur.estActif;
    data.methodeAuthentification = utilisateur.methodeAuth;
    data.createdAt = utilisateur.createdAt;
    data.updatedAt = utilisateur.updatedAt;
    data.adresse = {
      ville: adresse?.nom,
      typeSubdivision: adresse?.subdivision?.typeSubdivision ?? '',
      quartier: utilisateur.quartier?.nom,
      subdivision: adresse?.subdivision?.nom,
      pays: adresse?.pays?.nom ?? 'Cameroun',
    };

    return data;
  }

  /**
   * Rechercher   utilisateurs email, nomComplet insensibles à la casse
   */
  async searchByNameOrEmail(search: string) {
    const data = [] as InfosUtilisateurDto[];
    const queryBuilder =
      this.utilisateursRepository.createQueryBuilder('utilisateur');
    queryBuilder.select(['utilisateur.id']);
    queryBuilder.orWhere(
      'LOWER(utilisateur.email) LIKE LOWER(:search) OR LOWER(utilisateur.nomComplet) LIKE LOWER(:search)',
      {
        search: `%${search}%`,
      },
    );

    const utilisateurs = await queryBuilder.getMany();

    data.push(
      ...(
        await Promise.all(
          utilisateurs.map(async (utilisateur) => {
            const userData = await this.find(utilisateur.id);
            if (userData) {
              return userData;
            }
            return null;
          }),
        )
      ).filter((userData) => userData !== null),
    );

    return data;
  }

  async findAll(page: number, limit: number) {
    const data = [] as InfosUtilisateurDto[];
    const [utilisateurs, total] =
      await this.utilisateursRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
        },
      });

    data.push(
      ...(
        await Promise.all(
          utilisateurs.map(async (utilisateur) => {
            const userData = await this.find(utilisateur.id);
            if (userData) {
              return userData;
            }
            return null;
          }),
        )
      ).filter((userData) => userData !== null),
    );
    return {
      utilisateurs: data,
      total,
      page,
      limit,
    };
  }

  async findOne(email: string) {
    return this.utilisateursRepository.findOneBy({ email });
  }
}
