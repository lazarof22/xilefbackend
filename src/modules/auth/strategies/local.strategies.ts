import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'correo_empleado' });
  }

  async validate(correo_empleado: string, contraseña: string): Promise<any> {
    const usuario = await this.authService.validateUser(correo_empleado, contraseña);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas. Por favor, verifique sus datos');
    }
    return usuario;
  }
}