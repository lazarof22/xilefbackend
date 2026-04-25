export class CreateAuthDto {
  ci_empleado!: string;
  nombre_empleado!: string;
  correo_empleado!: string;
  contraseña!: string;
  departamento!: string;
  cargo!: string;
  salario!: number;
  rol?: string;
}
