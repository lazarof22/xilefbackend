import { CuotaCalculada } from './types/credito.types';

export function calcularAmortizacionFrances(
  principal: number,
  tasaAnual: number,
  plazoMeses: number,
  fechaInicio: Date,
): CuotaCalculada[] {
  const i = tasaAnual / 12 / 100;
  const cuota = (principal * i) / (1 - Math.pow(1 + i, -plazoMeses));
  let saldo = principal;
  const cuotas: CuotaCalculada[] = [];
  for (let n = 1; n <= plazoMeses; n++) {
    const interes = saldo * i;
    const capital = cuota - interes;
    saldo = Math.max(0, saldo - capital);
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + n);
    cuotas.push({
      numero: n,
      fechaVencimiento: fecha,
      capital: Number(capital.toFixed(2)),
      interes: Number(interes.toFixed(2)),
      cuotaTotal: Number(cuota.toFixed(2)),
      saldoRestante: Number(saldo.toFixed(2)),
    });
  }
  return cuotas;
}

export function calcularAmortizacionAleman(
  principal: number,
  tasaAnual: number,
  plazoMeses: number,
  fechaInicio: Date,
): CuotaCalculada[] {
  const i = tasaAnual / 12 / 100;
  const capitalFijo = principal / plazoMeses;
  let saldo = principal;
  const cuotas: CuotaCalculada[] = [];
  for (let n = 1; n <= plazoMeses; n++) {
    const interes = saldo * i;
    const cuota = capitalFijo + interes;
    saldo = saldo - capitalFijo;
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + n);
    cuotas.push({
      numero: n,
      fechaVencimiento: fecha,
      capital: Number(capitalFijo.toFixed(2)),
      interes: Number(interes.toFixed(2)),
      cuotaTotal: Number(cuota.toFixed(2)),
      saldoRestante: Math.max(0, Number(saldo.toFixed(2))),
    });
  }
  return cuotas;
}
