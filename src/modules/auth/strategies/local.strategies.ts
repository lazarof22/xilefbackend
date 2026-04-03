import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'correo_usuario' });
  }

  async validate(correo_usuario: string, contraseña: string): Promise<any> {
    const usuario = await this.authService.validateUser(correo_usuario, contraseña);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas. Por favor, verifique sus datos');
    }
    return usuario;
  }
}