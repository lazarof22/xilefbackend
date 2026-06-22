import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import type { UsuarioDocument } from '../../auth/schemas/empleado.schema';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos los usuarios (admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll(): Promise<UsuarioDocument[]> {
    return this.usuariosService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo usuario (admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  create(@Body() dto: CreateUsuarioDto): Promise<UsuarioDocument> {
    return this.usuariosService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un usuario (admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.usuariosService.remove(id);
  }
}
