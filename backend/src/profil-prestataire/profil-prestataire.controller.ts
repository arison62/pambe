import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ProfilPrestataireService } from './profil-prestataire.service';
import CreationProfilePrestataireDto from './dtos/creation-profile-dto';
import InfosProfilUtilisateurDto from './dtos/infos-profil-utilisateur-dto';

@ApiTags('Profil Prestataire')
@Controller('profil-prestataire')
export class ProfilPrestataireController {
  constructor(private profilPrestaireService: ProfilPrestataireService) {}

  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    description: 'Numéro de la page à récupérer (par défaut 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    default: 10,
    description: "Nombre d'éléments par page (par défaut 10)",
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Aucun prestataire trouvé',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Profil prestataire récupéré avec succès',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(InfosProfilUtilisateurDto),
          },
        },
        total: {
          type: 'number',
        },
        page: {
          type: 'number',
        },
        limit: {
          type: 'number',
        },
      },
    },
  })
  @Get()
  async getAllPrestataires(
    @Query('page', new DefaultValuePipe<number>(1))
    page: number = 1,
    @Query('limit', new DefaultValuePipe<number>(10)) limit: number = 10,
    @Res() res: Response,
  ) {
    const { profils, total } =
      await this.profilPrestaireService.getAllProfilsPrestataires(page, limit);
    if (!profils || profils.length === 0) {
      return res.status(404).json({
        message: 'Aucun prestataire trouvé',
      });
    }
    return res.status(200).json({
      data: profils,
      total,
      page,
      limit,
    });
  }

  @ApiCreatedResponse({
    description: 'Profil prestataire créé avec succès',
    type: CreationProfilePrestataireDto,
  })
  @ApiNotFoundResponse({
    description: "Le profil prestataire n'a pas pu être créé",
  })
  @Post()
  async createProfilPrestataire(
    @Body()
    creationProfilPrestataireDto: CreationProfilePrestataireDto,
    @Res() res: Response,
  ) {
    const {
      idUtilisateur,
      biographie,
      anneesExperience,
      disponibiliteGenerale,
      verifieParAdmin,
    } = creationProfilPrestataireDto;

    const profilPrestataire =
      await this.profilPrestaireService.createProfilPrestataire(
        idUtilisateur,
        biographie,
        anneesExperience,
        disponibiliteGenerale,
        verifieParAdmin,
      );

    if (!profilPrestataire) {
      return res.status(404).json({
        message: "Le profil prestataire n'a pas pu être créé",
      });
    }

    return res.status(201).json(profilPrestataire);
  }

  @Put(':id')
  @ApiOkResponse({
    description: 'Profil prestataire mis à jour avec succès',
    type: CreationProfilePrestataireDto,
  })
  @ApiNotFoundResponse({
    description: "Le profil prestataire n'a pas pu être mis à jour",
  })
  async updateProfilPrestataire(
    @Body()
    creationProfilPrestataireDto: CreationProfilePrestataireDto,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const {
      biographie,
      anneesExperience,
      disponibiliteGenerale,
      verifieParAdmin,
    } = creationProfilPrestataireDto;

    const profilPrestataire =
      await this.profilPrestaireService.updateProfilPrestataire(
        id,
        biographie,
        anneesExperience,
        disponibiliteGenerale,
        verifieParAdmin,
      );

    if (!profilPrestataire) {
      return res.status(404).json({
        message: "Le profil prestataire n'a pas pu être mis à jour",
      });
    }

    return res.status(200).json(profilPrestataire);
  }
}
