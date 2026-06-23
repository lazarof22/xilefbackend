import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ImportExportService } from './import-export.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';

@ApiTags('Import/Export')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('administrador')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('importar/csv')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Importar productos desde CSV (admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Resultado de la importación' })
  importCsv(
    @Body('csv') csv: string,
  ): Promise<{ imported: number; errors: string[] }> {
    return this.importExportService.importProductsFromCsv(csv);
  }

  @Get('respaldo/exportar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exportar toda la BD como JSON (admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'JSON con todos los datos' })
  exportar(): Promise<Record<string, unknown[]>> {
    return this.importExportService.exportAllToJson();
  }

  @Post('respaldo/importar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Importar datos desde JSON (admin)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Resultado de la importación' })
  importar(
    @Body() data: Record<string, unknown[]>,
  ): Promise<{ imported: number; errors: string[] }> {
    return this.importExportService.importFromJson(data);
  }
}
