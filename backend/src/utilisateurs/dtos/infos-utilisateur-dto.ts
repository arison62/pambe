import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema()
export default class InfosUtilisateurDto {
  @ApiProperty()
  id: number;
  @ApiProperty({
    required: false,
  })
  nomComplet: string;
  @ApiProperty()
  email: string;
  @ApiProperty({
    required: false,
  })
  numeroTelephone: string;
  @ApiProperty({ required: false })
  urlPhotoProfil: string;
  @ApiProperty()
  role: string;
  @ApiProperty()
  telephoneVerifie: boolean;
  @ApiProperty()
  emailVerifie: boolean;
  @ApiProperty()
  estActif: boolean;
  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'number' },
      nom: { type: 'string' },
      typeSubdivision: { type: 'string' },
      pays: { type: 'string' },
    },
    example: {
      nom: 'Bafoussam',
      typeSubdivision: 'région',
      pays: 'Cameroun',
    },
  })
  adresse: {
    ville?: string;
    quartier?: string;
    subdivision?: string;
    typeSubdivision: string;
    pays: string;
  };
  methodeAuthentification: string;
  createdAt: Date;
  updatedAt: Date;
}
