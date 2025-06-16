import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import InfosUtilisateurDto from 'src/utilisateurs/dtos/infos-utilisateur-dto';

@ApiSchema({
  name: 'InfosProfilUtilisateurDto',
})
export default class InfosProfilUtilisateurDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  biographie: string;
  @ApiProperty()
  anneesExperience: number;
  @ApiProperty()
  disponibiliteGenerale: string;
  @ApiProperty()
  verifieParAdmin: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: InfosUtilisateurDto,
  })
  utilisateur: InfosUtilisateurDto;
}
