import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export default class CreationProfilePrestataireDto {
  @ApiProperty({
    description: 'La biographie du prestataire',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  biographie: string;

  @ApiProperty({
    description: "Le nombre d'années d'expérience du prestataire",
    required: false,
    type: Number,
    minimum: 0,
    maximum: 50,
    example: 5,
  })
  @IsOptional()
  @IsNumber({})
  anneesExperience: number;

  @ApiProperty({
    description: 'La disponibilité générale du prestataire',
    required: false,
    type: String,
  })
  disponibiliteGenerale: string;

  @ApiProperty({
    description: 'Indique si le profil a été vérifié par un administrateur',
    required: false,
    type: Boolean,
    default: false,
  })
  verifieParAdmin: boolean;

  @ApiProperty({
    description: "L'ID de l'utilisateur auquel ce profil appartient",
    type: Number,
    required: true,
  })
  idUtilisateur: number;
}
