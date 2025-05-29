import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { MethodeAuth, TypeRole } from 'src/entities/utilisateur.entity';
import { Optional } from '@nestjs/common';

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
  MotDePasse: string;

  @ApiProperty({
    description: "Le nom complet de l'utilisateur",
    required: false,
  })
  @IsString()
  @IsOptional()
  nomComplet: string;

  @ApiProperty({
    description: "Le numéro de téléphone de l'utilisateur",
    required: false,
    example: '+237 650 xxx xxx',
  })
  @IsString()
  @IsOptional()
  numeroTelephone: string;

  @ApiProperty({
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  emailVerifie: boolean;

  @ApiProperty({
    enum: ['CLIENT', 'PRESTAIRE', 'ADMIN'],
    default: 'CLIENT',
    required: false,
  })
  @Optional()
  @IsValidRole('role', {
    message: 'Le role doit être CLIENT, PRESTATAIRE ou ADMIN',
  })
  @IsOptional()
  role: string;

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
