// Lectura de CFDI 3.3 / 4.0 en el navegador (DOMParser). El archivo nunca sale del equipo del usuario.

export type MovimientoCfdi = {
  origen: 'comprobante' | 'pago'; // TipoCambio del comprobante o TipoCambioP de un complemento de pagos
  fecha: string; // AAAA-MM-DD (Fecha de emisión o FechaPago)
  moneda: string;
  tipoCambio: number | null;
  monto: number; // Total del comprobante o Monto del pago, en la moneda original
};

export type CfdiLeido = {
  archivo: string;
  uuid?: string;
  serieFolio?: string;
  tipo: string; // I, E, P, N, T
  emisor?: string;
  receptor?: string;
  movimientos: MovimientoCfdi[];
  error?: string;
};

/** Elementos por nombre local, sin importar el prefijo (cfdi:, pago20:, pago10:, tfd:). */
function porNombre(doc: Document, nombre: string): Element[] {
  return Array.from(doc.getElementsByTagName('*')).filter((e) => e.localName === nombre);
}

const numero = (v: string | null) => (v == null || v === '' ? null : Number(v));

export function leerCfdi(archivo: string, xml: string): CfdiLeido {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) {
    return { archivo, tipo: '?', movimientos: [], error: 'No es un XML válido.' };
  }
  const c = doc.documentElement;
  if (c.localName !== 'Comprobante') {
    return { archivo, tipo: '?', movimientos: [], error: 'No parece un CFDI (falta el nodo Comprobante).' };
  }

  const tipo = c.getAttribute('TipoDeComprobante') ?? '?';
  const serie = c.getAttribute('Serie') ?? '';
  const folio = c.getAttribute('Folio') ?? '';
  const movimientos: MovimientoCfdi[] = [];

  if (tipo === 'P') {
    for (const p of porNombre(doc, 'Pago')) {
      movimientos.push({
        origen: 'pago',
        fecha: (p.getAttribute('FechaPago') ?? '').slice(0, 10),
        moneda: p.getAttribute('MonedaP') ?? '',
        tipoCambio: numero(p.getAttribute('TipoCambioP')),
        monto: numero(p.getAttribute('Monto')) ?? 0,
      });
    }
  } else {
    movimientos.push({
      origen: 'comprobante',
      fecha: (c.getAttribute('Fecha') ?? '').slice(0, 10),
      moneda: c.getAttribute('Moneda') ?? '',
      tipoCambio: numero(c.getAttribute('TipoCambio')),
      monto: numero(c.getAttribute('Total')) ?? 0,
    });
  }

  return {
    archivo,
    uuid: porNombre(doc, 'TimbreFiscalDigital')[0]?.getAttribute('UUID') ?? undefined,
    serieFolio: [serie, folio].filter(Boolean).join('-') || undefined,
    tipo,
    emisor: porNombre(doc, 'Emisor')[0]?.getAttribute('Nombre') ?? undefined,
    receptor: porNombre(doc, 'Receptor')[0]?.getAttribute('Nombre') ?? undefined,
    movimientos,
  };
}

export type Punto = { fecha: string; valor: number };

export type Revision =
  | { estado: 'correcto'; esperado: number; origen?: string }
  | { estado: 'mismo-dia'; esperado: number; mismoDia: number; origen?: string }
  | { estado: 'diferente'; esperado: number; diferencia: number; impactoMxn: number; origen?: string }
  | { estado: 'no-aplica'; motivo: string };

function ultimoHasta(puntos: Punto[], fecha: string): Punto | undefined {
  for (let i = puntos.length - 1; i >= 0; i--) if (puntos[i].fecha <= fecha) return puntos[i];
  return undefined;
}

const diaAnterior = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

const r4 = (n: number) => Math.round(n * 10000) / 10000;

/**
 * Compara el tipo de cambio del CFDI con el que corresponde a su fecha:
 * el publicado en el DOF el día hábil anterior (SF60653 de esa fecha).
 * Si no coincide, revisa si coincide con el publicado ese mismo día (error frecuente).
 */
export function revisar(m: MovimientoCfdi, liquidacion: Punto[], publicaciones: Punto[]): Revision {
  if (m.moneda === 'MXN' || m.moneda === 'XXX') {
    return { estado: 'no-aplica', motivo: m.moneda === 'MXN' ? 'Factura en pesos' : 'Sin moneda (XXX)' };
  }
  if (m.moneda !== 'USD') return { estado: 'no-aplica', motivo: `Moneda ${m.moneda}: por ahora solo revisamos USD` };
  if (m.tipoCambio == null) return { estado: 'no-aplica', motivo: 'El CFDI no trae tipo de cambio' };
  if (!liquidacion.length || m.fecha < liquidacion[0].fecha) {
    return { estado: 'no-aplica', motivo: 'Fecha fuera del periodo disponible' };
  }

  const esperado = ultimoHasta(liquidacion, m.fecha);
  if (!esperado) return { estado: 'no-aplica', motivo: 'Sin tipo de cambio para esa fecha' };
  const origen = ultimoHasta(publicaciones, diaAnterior(m.fecha))?.fecha;
  const tc = r4(m.tipoCambio);

  if (tc === r4(esperado.valor)) return { estado: 'correcto', esperado: esperado.valor, origen };

  const mismoDia = publicaciones.find((p) => p.fecha === m.fecha);
  if (mismoDia && tc === r4(mismoDia.valor)) {
    return { estado: 'mismo-dia', esperado: esperado.valor, mismoDia: mismoDia.valor, origen };
  }

  const diferencia = r4(m.tipoCambio - esperado.valor);
  return {
    estado: 'diferente',
    esperado: esperado.valor,
    diferencia,
    impactoMxn: Math.round(m.monto * diferencia * 100) / 100,
    origen,
  };
}
