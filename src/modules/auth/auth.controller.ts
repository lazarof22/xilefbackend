import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(
    @Body('nombre_usuario') nombre_usuario: string,
    @Body('correo_usuario') correo_usuario: string,
    @Body('contraseña') contraseña: string,
    @Body('rol') rol?: string,
  ) {
    return this.authService.register(nombre_usuario, correo_usuario, contraseña, rol);
  }

   @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

}