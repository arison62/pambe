import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { MethodeAuth, TypeRole } from 'src/common/entities/utilisateur.entity';

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
  @ApiProperty({
    description: "Le nom d'utilisateur",
    required: false,
  })
  @IsString()
  @IsOptional()
  numeroTelephone: string;

  @ApiProperty({
    description: "L'email de l'utilisateur",
  })
  @IsEmail({}, { message: "L'email doit être valide" })
  email: string;

  @IsString()
  @MinLength(7, {
    message: 'Le mot de passe doit contenir au moins 7 caractères',
  })
  @ApiProperty({
    description: "mot de passe de l'utilisateur",
    minLength: 7,
  })
  @IsOptional()
  motDePasse: string;

  @ApiProperty({
    description: "Le nom complet de l'utilisateur",
    required: false,
  })
  @IsString()
  @IsOptional()
  nomComplet: string;

  @ApiProperty({
    description: "L'ID de la ville de l'utilisateur",
    required: false,
  })
  @IsOptional()
  idVille: number;

  @ApiProperty({
    description: "L'ID du quartier de l'utilisateur",
    required: false,
  })
  @IsOptional()
  idQuartier: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: "Photo de profil de l'utilisateur",
    required: false,
    maximum: 20000000, // 20 Mo
  })
  @IsOptional()
  urlPhotoProfil: string;

  @IsValidRole('role', {
    message: 'Le role doit être CLIENT, PRESTATAIRE ou ADMIN',
  })
  @ApiProperty({
    enum: ['CLIENT', 'PRESTATAIRE', 'ADMIN'],
    default: 'CLIENT',
    required: false,
  })
  @IsOptional()
  role: string;

  @ApiProperty({
    type: Boolean,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  telephoneVerifie: boolean;

  @ApiProperty({
    type: Boolean,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  emailVerifie: boolean;

  @ApiProperty({
    type: Boolean,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  estActif: boolean;

  @ApiProperty({
    enum: ['EMAIL_PASSWORD', 'GOOGLE'],
    default: 'EMAIL_PASSWORD',
    required: false,
    description: "Specifie la methode d'authentification de l'utilisateur",
  })
  @IsValidMethodAuth('methodeAuth')
  @IsOptional()
  methodeAuth: string;
}
