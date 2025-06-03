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

@Injectable()
export class UtilisateursService {
  constructor(
    @InjectRepository(Utilisateur)
    private utilisateursRepository: Repository<Utilisateur>,
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
  ) {
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

    return await this.utilisateursRepository.save({
      ...user,
      ...updatedFields,
      role: TypeRole[utilisateurDto.role as keyof typeof TypeRole] ?? user.role,
      methodeAuth:
        MethodeAuth[utilisateurDto.methodeAuth as keyof typeof MethodeAuth] ??
        user.methodeAuth,
    });
  }

  async findOne(email: string) {
    return this.utilisateursRepository.findOneBy({ email });
  }
}
