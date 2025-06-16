import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ServiceCompetenceService } from './service-competence.service';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  CreationCompetenceDto,
  InfosCompetenceDto,
} from './dtos/competence-dto';
import InfosProfilUtilisateurDto from 'src/profil-prestataire/dtos/infos-profil-utilisateur-dto';

@ApiTags('Service et Competence')
@Controller('service-competence')
export class ServiceCompetenceController {
  constructor(private serviceCompetenceService: ServiceCompetenceService) {}

  @Get('competences')
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
  @ApiOkResponse({
    description: 'Liste des competences',
    schema: {
      type: 'object',
      properties: {
        competences: {
          type: 'array',
          items: {
            $ref: getSchemaPath(InfosCompetenceDto),
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
  @ApiNotFoundResponse({
    description: 'Aucune competence trouvée',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  async getCompetences(
    @Query('page', new DefaultValuePipe<number>(1)) page: number,
    @Query('limit', new DefaultValuePipe<number>(10)) limit: number,
    @Res() res: Response,
  ) {
    const { competences, total } =
      await this.serviceCompetenceService.getCompetences(page, limit);
    if (!competences || competences.length === 0) {
      return res.status(404).json({
        message: 'Aucune competence trouvée',
      });
    }
    return res.status(200).json({
      competences,
      total,
      page,
      limit,
    });
  }

  @Get('comptences/:id/prestataires')
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
  @ApiOkResponse({
    description: 'Liste des prestataires avec la competence',
    schema: {
      type: 'object',
      properties: {
        prestataires: {
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
  @ApiNotFoundResponse({
    description: 'Aucun prestataire trouvée',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
      example: {
        message: 'Aucun prestataire trouvée',
      },
    },
  })
  async getCompetenceById(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe<number>(10)) limit: number,
    @Query('page', new DefaultValuePipe<number>(1)) page: number,
    @Res() res: Response,
  ) {
    const { prestataires, total } =
      await this.serviceCompetenceService.getPrestataireByCompetence(
        id,
        limit,
        page,
      );

    if (!prestataires || prestataires.length === 0) {
      return res.status(404).json({
        message: 'Aucun prestataire trouvée',
      });
    }
    return res.status(200).json({
      prestataires,
      total,
      page,
      limit,
    });
  }

  @Get('comptences/prestataires/:id')
  @ApiOkResponse({
    description: 'Infos de la competence',
    schema: {
      type: 'object',
      properties: {
        competences: {
          type: 'array',
          items: {
            $ref: getSchemaPath(InfosCompetenceDto),
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Aucune competence trouvée',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  async getInfosCompetence(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const competences =
      await this.serviceCompetenceService.getCompetencePrestataire(id);
    if (!competences || competences.length === 0) {
      return res.status(404).json({
        message: 'Aucune competence trouvée',
      });
    }
    return res.status(200).json(competences);
  }

  @Post('comptences')
  @ApiOkResponse({
    description: 'Création de la competence',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
        },
        nom: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  async create(
    @Body() competenceDto: CreationCompetenceDto,
    @Res() res: Response,
  ) {
    try {
      const competence = await this.serviceCompetenceService.createCompetence(
        competenceDto.nom,
        competenceDto.description,
      );
      return res.status(201).json(competence);
    } catch (error: unknown) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  }

  @Post('comptences/:idCompetence/prestataires/:idPrestataire')
  @ApiCreatedResponse({
    description: 'Ajout du prestataire à la competence',
  })
  async addPrestataireToCompetence(
    @Param('idCompetence', ParseIntPipe) idCompetence: number,
    @Param('idPrestataire', ParseIntPipe) idPrestataire: number,
    @Res() res: Response,
  ) {
    try {
      await this.serviceCompetenceService.createCompetencePrestataire(
        idPrestataire,
        idCompetence,
      );
      return res.status(201).json();
    } catch (error: unknown) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    }
  }

  @Delete('comptences/:idCompetence/prestataires/:idPrestataire')
  @ApiNoContentResponse({
    description: 'Suppression du prestataire de la competence',
  })
  async removePrestataireFromCompetence(
    @Param('idCompetence', ParseIntPipe) idCompetence: number,
    @Param('idPrestataire', ParseIntPipe) idPrestataire: number,
    @Res() res: Response,
  ) {
    await this.serviceCompetenceService.deleteCompetencePrestataire(
      idPrestataire,
      idCompetence,
    );
    return res.status(204).json();
  }
}
