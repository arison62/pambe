import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig, jwtConfig } from './configs/configurations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigs } from './configs/types';
import { AuthModule } from './auth/auth.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development'],
      load: [databaseConfig, jwtConfig],
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfig = configService.get<DatabaseConfigs>('database');
        if (!databaseConfig) {
          throw new Error('Database configuration is not defined');
        }
        const { url } = databaseConfig;
        return {
          type: 'postgres',
          url,
          autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        };
      },
    }),

    AuthModule,

    UtilisateursModule,
  ],
})
export class AppModule {}
