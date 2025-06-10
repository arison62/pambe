import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import ModificationUtilisateurDto from './dtos/modification-utilisateur-dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';
import InfosUtilisateurDto from './dtos/infos-utilisateur-dto';

@ApiTags('Utilisateurs')
@ApiBadRequestResponse({
  description: 'Erreur de validation',
  schema: {
    type: 'object',
    properties: {
      message: {
        items: {
          type: 'string',
        },
      },
    },
  },
})
@ApiNotFoundResponse({
  description: 'Utilisateur non trouvé',
  schema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
    },
  },
})
@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private utilisateursService: UtilisateursService) {}

  @Get()
  @ApiOperation({
    summary: 'Rechercher des utilisateurs',
    description:
      "Recherche des utilisateurs par nom ou email. Si aucun paramètre de recherche n'est fourni, retourne tous les utilisateurs.",
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Recherche par nom ou email',
    type: String,
    minLength: 3,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: "Nombre maximum d'utilisateurs à retourner",
    type: Number,
    example: 50,
    minimum: 1,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Numéro de page',
    type: Number,
    example: 1,
    minimum: 1,
  })
  @ApiOkResponse({
    description: 'Liste des utilisateurs',
    schema: {
      type: 'object',
      properties: {
        utilisateurs: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/InfosUtilisateurDto',
          },
        },
        total: {
          type: 'number',
        },
        page: {
          type: 'number',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Recherche trop courte',
  })
  async search(
    @Res() res: Response,
    @Query('search') search: string,
    @Query('limit') limit: number = 50,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    // Si une recherche est fournie, rechercher les utilisateurs par nom ou email
    if (search && search.length > 2) {
      const utilisateurs =
        await this.utilisateursService.searchByNameOrEmail(search);
      if (utilisateurs.length === 0) {
        return res.status(404).json({
          message: 'Aucun utilisateur trouvé',
        });
      } else {
        return res.status(200).json({
          utilisateurs,
          page: 1,
          total: utilisateurs.length,
        });
      }
    } else if (search && search.length <= 2) {
      return res.status(400).json({
        message: 'Recherche trop courte',
      });
    }
    // Si pas de recherche, retourner tous les utilisateurs
    const { utilisateurs, total } = await this.utilisateursService.findAll(
      page,
      limit,
    );
    if (utilisateurs.length === 0) {
      return res.status(404).json({
        message: 'Aucun utilisateur trouvé',
      });
    } else {
      return res.status(200).json({
        utilisateurs,
        total,
        page,
      });
    }
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Utilisateur trouvé',
    type: InfosUtilisateurDto,
  })
  async find(@Param('id', ParseIntPipe) id: number) {
    const utilisateur = await this.utilisateursService.find(id);
    if (!utilisateur) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return utilisateur;
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('urlPhotoProfil'))
  @ApiCreatedResponse({
    description: 'Utilisateur modifié',
    type: InfosUtilisateurDto,
  })
  @Put(':id')
  async updateUtilisateur(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'image/*' })
        .addMaxSizeValidator({
          maxSize: 50000,
        })
        .build({
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,

    @Res()
    res: Response,
    @Body()
    modificationUtilisateur: ModificationUtilisateurDto,
  ) {
    if (file) {
      const directory = 'uploads/profile';
      await mkdir(directory, { recursive: true }); // Créer le répertoire s'il n'existe pas

      const filePath = `${directory}/${id}.${file.originalname}`; // Utiliser l'ID de l'utilisateur pour nommer le fichier

      await writeFile(filePath, file.buffer);
      modificationUtilisateur.urlPhotoProfil = filePath; // Mettre à jour l'URL de la photo de profil
    }
    const utilisateurModifie =
      await this.utilisateursService.modifierUtilisateur(
        id,
        modificationUtilisateur,
      );

    return res.status(201).json({
      message: 'Utilisateur modifié avec succès',
      utilisateur: utilisateurModifie,
    });
  }
}
