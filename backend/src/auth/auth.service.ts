import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UtilisateursService } from 'src/utilisateurs/utilisateurs.service';
import { JwtService } from '@nestjs/jwt';
import CreationUtilisateurDto from 'src/utilisateurs/dto/creation-utilisateur.dto';

@Injectable()
export class AuthService {
  constructor(
    private utilisateursService: UtilisateursService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, motDePasse: string) {
    const user = await this.utilisateursService.findOne(email);
    if (user && (await bcrypt.compare(motDePasse, user.hashMotDePasse))) {
      const payload = {
        email: user.email,
        sub: user.id,
        role: user.role.toString(),
      };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    }
    throw new NotFoundException();
  }

  async signUp(creationUtilisateurDto: CreationUtilisateurDto) {
    const user = await this.utilisateursService.createUtilisateur(
      creationUtilisateurDto,
    );

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.toString(),
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
