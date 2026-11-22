// IVA y retenciones al facturar como persona física (2026), y estimado del impuesto mensual en RESICO.
// Fundamentos: arts. 1-A LIVA y 3 RLIVA (retención de IVA), 106 y 116 LISR (10 % ISR honorarios y
// arrendamiento), 113-E y 113-J LISR (RESICO), decreto región fronteriza (IVA 8 %, vigente al 31-dic-2026).

export type Regimen = 'resico' | 'general';
export type Actividad = 'honorarios' | 'renta-local' | 'renta-casa' | 'venta' | 'autotransporte';
export type Cliente = 'empresa' | 'persona';
export type Modo = 'subtotal' | 'total' | 'deposito';

export const ACTIVIDADES: { valor: Actividad; texto: string }[] = [
  { valor: 'honorarios', texto: 'Servicios profesionales u honorarios' },
  { valor: 'renta-local', texto: 'Renta de local, oficina o bodega' },
  { valor: 'renta-casa', texto: 'Renta de casa habitación' },
  { valor: 'venta', texto: 'Venta de productos' },
  { valor: 'autotransporte', texto: 'Autotransporte de carga (fletes)' },
];

export type Entrada = {
  regimen: Regimen;
  actividad: Actividad;
  cliente: Cliente;
  ivaFrontera: boolean;
  modo: Modo;
  monto: number;
};

export type Factura = {
  tasaIva: number; // %
  tasaRetIsr: number; // %
  tasaRetIva: number; // % sobre el subtotal
  subtotal: number;
  iva: number;
  retIsr: number;
  retIva: number;
  total: number;
  deposito: number; // lo que efectivamente recibes
  claveRegimen: string;
  notas: string[];
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function tasas(e: Omit<Entrada, 'modo' | 'monto'>) {
  const notas: string[] = [];
  const tasaIva = e.actividad === 'renta-casa' ? 0 : e.ivaFrontera ? 8 : 16;
  if (e.actividad === 'renta-casa') notas.push('La renta de casa habitación está exenta de IVA.');
  if (e.ivaFrontera && tasaIva) notas.push('El IVA de 8 % solo aplica si estás inscrito en el padrón de la región fronteriza.');

  let tasaRetIsr = 0;
  let tasaRetIva = 0;
  if (e.cliente === 'empresa') {
    // ISR: 1.25 % a RESICO por cualquier actividad; 10 % a honorarios y rentas en régimen general.
    if (e.regimen === 'resico') tasaRetIsr = 1.25;
    else if (['honorarios', 'renta-local', 'renta-casa'].includes(e.actividad)) tasaRetIsr = 10;

    // IVA: 4 % en fletes; 2/3 del IVA en honorarios y rentas gravadas; nada en venta de productos.
    if (e.actividad === 'autotransporte') tasaRetIva = 4;
    else if (['honorarios', 'renta-local'].includes(e.actividad)) tasaRetIva = Math.round((tasaIva * 2) / 3 * 10000) / 10000;
  } else {
    notas.push('Si le facturas a una persona física o al público en general, no hay retenciones.');
  }

  const claveRegimen =
    e.regimen === 'resico'
      ? '626 · Régimen Simplificado de Confianza'
      : e.actividad === 'renta-local' || e.actividad === 'renta-casa'
        ? '606 · Arrendamiento'
        : '612 · Personas Físicas con Actividades Empresariales y Profesionales';

  return { tasaIva, tasaRetIsr, tasaRetIva, claveRegimen, notas };
}

export function calcularFactura(e: Entrada): Factura | null {
  if (!(e.monto > 0)) return null;
  const t = tasas(e);
  const f = (t.tasaIva - t.tasaRetIsr - t.tasaRetIva) / 100;
  const subtotal = r2(
    e.modo === 'subtotal' ? e.monto : e.modo === 'total' ? e.monto / (1 + t.tasaIva / 100) : e.monto / (1 + f),
  );
  const iva = r2((subtotal * t.tasaIva) / 100);
  const retIsr = r2((subtotal * t.tasaRetIsr) / 100);
  const retIva = r2((subtotal * t.tasaRetIva) / 100);
  const total = r2(subtotal + iva);
  return { ...t, subtotal, iva, retIsr, retIva, total, deposito: r2(total - retIsr - retIva) };
}

// RESICO personas físicas, tabla mensual (art. 113-E LISR). Sin cambios para 2026.
export const TABLA_RESICO_MENSUAL: { hasta: number; tasa: number }[] = [
  { hasta: 25000, tasa: 1 },
  { hasta: 50000, tasa: 1.1 },
  { hasta: 83333.33, tasa: 1.5 },
  { hasta: 208333.33, tasa: 2 },
  { hasta: 291666.67, tasa: 2.5 },
];

export type ImpuestoMes = {
  tasaIsr: number | null; // null = rebasa el límite mensual de RESICO
  isrCausado: number;
  isrAPagar: number;
  ivaAPagar: number;
  saldoIva: number; // a favor, si el IVA acreditable y retenido supera al cobrado
};

/** Estimado del pago mensual de RESICO: ISR sobre ingresos cobrados sin IVA, e IVA del mes. */
export function impuestoMesResico(
  ingresos: number,
  isrRetenido: number,
  ivaCobrado: number,
  ivaRetenido: number,
  ivaGastos: number,
): ImpuestoMes {
  const renglon = TABLA_RESICO_MENSUAL.find((r) => ingresos <= r.hasta);
  const tasaIsr = renglon?.tasa ?? null;
  const isrCausado = tasaIsr === null ? 0 : r2((ingresos * tasaIsr) / 100);
  const iva = r2(ivaCobrado - ivaRetenido - ivaGastos);
  return {
    tasaIsr,
    isrCausado,
    isrAPagar: Math.max(0, r2(isrCausado - isrRetenido)),
    ivaAPagar: Math.max(0, iva),
    saldoIva: Math.max(0, -iva),
  };
}
