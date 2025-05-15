import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './configs/configurations';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigs } from './configs/types';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env.development'],
      load: [databaseConfig],
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
        };
      },
    }),
  ],
})
export class AppModule {}
