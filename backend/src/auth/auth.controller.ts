import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UtilisateursService } from 'src/utilisateurs/utilisateurs.service';
import CreationUtilisateurDto from 'src/utilisateurs/dtos/creation-utilisateur.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { mkdir, writeFile } from 'node:fs/promises';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UtilisateursService,
  ) {}

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        motDepasse: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Email ou mot de passe incorrect',
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
  @ApiNotFoundResponse({ description: 'Utilisateur non trouvé' })
  @ApiUnauthorizedResponse({ description: 'Mot de passe incorrect' })
  @ApiOkResponse({
    description: 'Utilisateur authentifié',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @Post('signin')
  login(@Body() body: { email: string; motDepasse: string }) {
    return this.authService.signIn(body.email, body.motDepasse);
  }

  @ApiConsumes('multipart/form-data')
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
  @ApiResponse({
    status: 403,
    description: "L'Utilisateur existe deja",
  })
  @ApiCreatedResponse({
    description: 'Utilisateur créé',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @Post('signup')
  @UseInterceptors(FileInterceptor('urlPhotoProfil'))
  async signUp(
    @Body() creationUtilisateurDto: CreationUtilisateurDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'image/*' })
        .addMaxSizeValidator({
          maxSize: 20000000,
          message(maxSize) {
            return `La taille maximale du fichier est de ${maxSize / 1000000} Mo`;
          },
        })
        .build({
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,
  ) {
    const { id, access_token }: { id: number; access_token: string } =
      await this.authService.signUp(creationUtilisateurDto);
    if (file) {
      const directory = 'uploads/profile';
      await mkdir(directory, { recursive: true }); // Créer le répertoire s'il n'existe pas

      const filePath = `${directory}/${id}.${file.originalname}`; // Utiliser l'ID de l'utilisateur pour nommer le fichier

      await writeFile(filePath, file.buffer);
      await this.userService.modifierUtilisateur(id, {
        urlPhotoProfil: filePath, // Mettre à jour l'URL de la photo de profil
      });
    }
    return { access_token };
  }
}
