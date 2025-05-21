import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import CreationUtilisateurDto from 'src/utilisateurs/dto/creation-utilisateur.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  login(@Body() body: { email: string; motDepasse: string }) {
    return this.authService.signIn(body.email, body.motDepasse);
  }

  @Post('signup')
  signUp(@Body() creationUtilisateurDto: CreationUtilisateurDto) {
    return this.authService.signUp(creationUtilisateurDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: any){
    //@typescript-eslint/no-unsafe-member-access
    return req.user;
  }
}
