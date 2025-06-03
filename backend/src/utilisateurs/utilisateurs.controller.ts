import {
  Body,
  Controller,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Put,
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
  ApiTags,
  OmitType,
} from '@nestjs/swagger';
import ModificationUtilisateurDto from './dtos/modification-utilisateur-dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { mkdir, writeFile } from 'node:fs/promises';

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
@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private utilisateursService: UtilisateursService) {}

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('urlPhotoProfil'))
  @ApiCreatedResponse({
    description: 'Utilisateur modifié',
    type: OmitType(ModificationUtilisateurDto, ['motDePasse']),
  })
  @ApiNotFoundResponse({
    description: 'Utilisateur non trouvé',
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const filePath = `${directory}/${id}.${file.originalname}`; // Utiliser l'ID de l'utilisateur pour nommer le fichier
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await writeFile(filePath, file.buffer);
      modificationUtilisateur.urlPhotoProfil = filePath; // Mettre à jour l'URL de la photo de profil
    }
    const utilisateurModifie =
      await this.utilisateursService.modifierUtilisateur(
        id,
        modificationUtilisateur,
      );

    /**
     * save file in uploads/profile
     */

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashMotDePasse, ...utilisateurSansMotDePasse } = utilisateurModifie; // Ne pas renvoyer le mot de passe haché
    return res.status(201).json({
      message: 'Utilisateur modifié avec succès',
      utilisateur: utilisateurSansMotDePasse,
    });
  }
}
