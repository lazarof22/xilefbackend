import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN } from './constants/constants';
import { Usuario } from './schemas/usuario.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private userModel: Model<Usuario>,
    private jwtService: JwtService,
  ) { }


  async findAll(): Promise<Usuario[]> {
    return this.userModel
      .find()
      .select('-contraseña')
      .sort({ createdAt: -1 })
      .exec();
  }

  async register(nombre_usuario: string, correo_usuario: string, contraseña: string, rol?: string): Promise<{ access_token: string }> {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const user = new this.userModel({
      nombre_usuario,
      correo_usuario,
      contraseña: hashedPassword,
      rol: rol || 'empleado',
    });
    const savedUser = await user.save();

    // Genera el token igual que en login
    const payload = {correo_usuario: savedUser.correo_usuario, contraseña: savedUser._id, role: savedUser.rol };
    const access_token = this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: JWT_EXPIRES_IN,
    });

    return { access_token };
  }

  async validateUser(correo_usuario: string, contraseña: string): Promise<any> {
    const user = await this.userModel.findOne({ correo_usuario });
    if (user && (await bcrypt.compare(contraseña, user.contraseña))) {
      const { contraseña, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(usuario: any) {
    const payload = { correo_usuario: usuario.correo_usuario, sub: usuario._id, rol: usuario.rol ,nombre_usuario: usuario.nombre_usuario};
    return {
      access_token: this.jwtService.sign(payload, {
        secret: JWT_SECRET,
        expiresIn: JWT_EXPIRES_IN,
      }),
    };
  }

  async validateUserById(userId: string) {
    return this.userModel.findById(userId).select('-contraseña');
  }
}