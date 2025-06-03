import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import CreationUtilisateurDto from 'src/utilisateurs/dtos/creation-utilisateur.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  signUp(@Body() creationUtilisateurDto: CreationUtilisateurDto) {
    return this.authService.signUp(creationUtilisateurDto);
  }
}
