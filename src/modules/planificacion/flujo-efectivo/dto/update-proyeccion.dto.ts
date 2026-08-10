import { PartialType } from '@nestjs/swagger';
import { CreateProyeccionDto } from './create-proyeccion.dto';

export class UpdateProyeccionDto extends PartialType(CreateProyeccionDto) {}
