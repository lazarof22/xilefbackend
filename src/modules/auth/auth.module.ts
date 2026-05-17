import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario, UsuarioSchema } from './schemas/empleado.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from './constants/constants';
import { LocalStrategy } from './strategies/local.strategies';
import { JwtStrategy } from './strategies/jwt.strategies';
import { RolesGuard } from './guards/roles.guard';
import { CargoEmpleado, CargoEmpleadoSchema } from '../nomencladores/cargo_empleado/schema/cargo_empleado.schema';
import { Departamento, DepartamentoSchema } from '../nomencladores/departamento/schema/departamento.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }, { name: CargoEmpleado.name, schema: CargoEmpleadoSchema }, { name: Departamento.name, schema: DepartamentoSchema }]),
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],
})
export class AuthModule { }
