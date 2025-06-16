import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreationCompetenceDto {
  @ApiProperty({
    description: 'Nom de la comptence',
    example: 'Plomberie',
  })
  @IsString()
  nom: string;

  @ApiProperty({
    description: 'Description de la competence',
    example:
      " Installation, réparation et maintenance de tous les systèmes de plomberie résidentiels et commerciaux. Cela inclut le dépannage et la réparation de fuites d'eau, l'installation de robinetterie et d'appareils sanitaires (lavabos, toilettes, douches), la désobstruction de canalisations, ainsi que la mise en place et l'entretien de chauffe-eau. Expertise garantissant un fonctionnement optimal des réseaux d'eau et d'assainissement.",
  })
  @IsString()
  description: string;
}

export class InfosCompetenceDto extends PartialType(CreationCompetenceDto) {
  @ApiProperty({
    description: 'Id de la competence',
    example: 1,
  })
  id: number;
}
export class ModificationCompetenceDto extends PartialType(
  CreationCompetenceDto,
) {}
