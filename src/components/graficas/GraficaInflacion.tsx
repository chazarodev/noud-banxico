'use client';

import { useState } from 'react';
import { Segmentado } from '@/components/ui/Segmentado';
import { GraficaLineas } from './GraficaLineas';
import { TablaDatos } from './TablaDatos';

type PuntoMes = { mes: string; valor: number };
type Rango = '5' | '10' | '2000';

export function GraficaInflacion({ general, subyacente }: { general: PuntoMes[]; subyacente: PuntoMes[] }) {
  const [rango, setRango] = useState<Rango>('5');
  const ultimoMes = general.at(-1)?.mes ?? '2026-01';
  const desde = rango === '2000' ? '2000-01' : `${Number(ultimoMes.slice(0, 4)) - Number(rango)}${ultimoMes.slice(4)}`;
  const g = general.filter((p) => p.mes >= desde);
  const s = subyacente.filter((p) => p.mes >= desde);
  const sMap = new Map(s.map((p) => [p.mes, p.valor]));

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <Segmentado
          label="Periodo"
          modo="fila"
          value={rango}
          onChange={setRango}
          options={[
            { value: '5', label: '5 años' },
            { value: '10', label: '10 años' },
            { value: '2000', label: 'Desde 2000' },
          ]}
        />
      </div>
      <GraficaLineas
        titulo="Inflación anual general y subyacente en México"
        unidad="porcentaje"
        eje="mes"
        banda={{ desde: 2, hasta: 4, etiqueta: 'Intervalo de la meta de Banxico (2 % a 4 %)' }}
        referencia={{ valor: 3, etiqueta: 'meta de inflación de Banxico, 3 %' }}
        series={[
          { clave: 'general', nombre: 'Inflación general', color: 'var(--serie-2)', puntos: g.map((p) => ({ x: p.mes, valor: p.valor })) },
          { clave: 'subyacente', nombre: 'Subyacente', color: 'var(--serie-3)', puntos: s.map((p) => ({ x: p.mes, valor: p.valor })) },
        ]}
      />
      <TablaDatos
        columnas={['General', 'Subyacente']}
        unidad="porcentaje"
        eje="mes"
        filas={g.map((p) => ({ x: p.mes, valores: [p.valor, sMap.get(p.mes)] }))}
      />
    </div>
  );
}
