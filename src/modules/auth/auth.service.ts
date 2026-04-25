import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN } from './constants/constants';
import { Usuario } from './schemas/empleado.schema';
import { CreateAuthDto } from './dto/create-auth.dto';

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

  async register(createAuthDto: CreateAuthDto): Promise<{ access_token: string }> {
    const { ci_empleado, nombre_empleado, correo_empleado, contraseña, departamento, cargo, salario, rol } = createAuthDto;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const user = new this.userModel({
      ci_empleado,
      nombre_empleado,
      correo_empleado,
      contraseña: hashedPassword,
      departamento,
      cargo,
      salario,
      rol: rol || 'empleado',
    });
    const savedUser = await user.save();

    // Genera el token igual que en login
    const payload = { correo_empleado: savedUser.correo_empleado, sub: savedUser._id, rol: savedUser.rol, nombre_empleado: savedUser.nombre_empleado };
    const access_token = this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: JWT_EXPIRES_IN,
    });

    return { access_token };
  }

  async validateUser(correo_empleado: string, contraseña: string): Promise<any> {
    const user = await this.userModel.findOne({ correo_empleado });
    if (user && (await bcrypt.compare(contraseña, user.contraseña))) {
      const { contraseña, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(usuario: any) {
    const payload = { correo_empleado: usuario.correo_empleado, sub: usuario._id, rol: usuario.rol, nombre_empleado: usuario.nombre_empleado };
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