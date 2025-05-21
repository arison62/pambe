import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MethodeAuth,
  TypeRole,
  Utilisateur,
} from 'src/entities/utilisateur.entity';
import { Repository } from 'typeorm';
import CreationUtilisateurDto from './dto/creation-utilisateur.dto';

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
      throw new Error("L'utilisateur existe déjà");
    }
    const user = utilisateurDto as Utilisateur;
    user.role = TypeRole[utilisateurDto.role as keyof typeof TypeRole];
    user.methodeAuth =
      MethodeAuth[utilisateurDto.methodeAuth as keyof typeof MethodeAuth];
    return await this.utilisateursRepository.save(user);
  }

  async findOne(email: string) {
    return this.utilisateursRepository.findOneBy({ email });
  }
}
