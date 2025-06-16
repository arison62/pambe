import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import InfosProfilUtilisateurDto from './profil-prestataire/dtos/infos-profil-utilisateur-dto';
import { InfosCompetenceDto } from './service-competence/dtos/competence-dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Validation globale des corps de requete
   */
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('API Pambe')
    .setDescription("Description de l'API REST de l'application Pambe")
    .setVersion('1.0')
    .addTag('API Pambe')
    .addGlobalResponse({
      status: 500,
      description: 'Internal Server Error',
    })
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [InfosProfilUtilisateurDto, InfosCompetenceDto],
    });
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
