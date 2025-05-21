import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { registerDecorator, ValidationOptions } from 'class-validator';
import { MethodeAuth, TypeRole } from 'src/entities/utilisateur.entity';

export function IsValidRole(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidRole',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value in TypeRole;
        },
      },
    });
  };
}

export function IsValidMethodAuth(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidMethodAuth',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value in MethodeAuth;
        },
      },
    });
  };
}

export default class CreationUtilisateurDto {
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;

  @IsString()
  @MinLength(7, {
    message: 'Le mot de passe doit contenir au moins 7 caractères',
  })
  @IsOptional()
  hashMotDePasse: string;

  @IsString()
  @IsOptional()
  nomComplet: string;

  @IsBoolean()
  @IsOptional()
  emailVerifie: boolean;

  @IsValidRole('role', {
    message: 'Le role doit être CLIENT, PRESTATAIRE ou ADMIN',
  })
  @IsOptional()
  role: string;

  @IsValidMethodAuth('methodeAuth')
  @IsOptional()
  methodeAuth: string;
}
