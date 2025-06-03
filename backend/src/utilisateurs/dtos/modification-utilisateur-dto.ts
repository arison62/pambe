import CreationUtilisateurDto from './creation-utilisateur.dto';
import { PartialType } from '@nestjs/swagger';

export default class ModificationUtilisateurDto extends PartialType(
  CreationUtilisateurDto,
) {}
