import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UtilisateursModule } from 'src/utilisateurs/utilisateurs.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtConfigs } from 'src/configs/types';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UtilisateursModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfigs = configService.get<JwtConfigs>('jwt');
        if (!jwtConfigs) {
          throw new Error('JWT configuration is not defined');
        }
        console.log(jwtConfigs);
        return {
          secret: jwtConfigs.secret,
          signOptions: { expiresIn: jwtConfigs.expiresIn },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
