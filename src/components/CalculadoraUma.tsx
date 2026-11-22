'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Segmentado } from '@/components/ui/Segmentado';
import { Select } from '@/components/ui/Select';
import { Ayuda } from '@/components/ui/Tooltip';
import type { Uma } from '@/lib/fiscal/referencias';

type Tipo = 'diario' | 'mensual' | 'anual';
const pesos = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

export function CalculadoraUma({ umas }: { umas: Uma[] }) {
  const [anio, setAnio] = useState(umas[0].anio);
  const [cantidad, setCantidad] = useState('30');
  const [tipo, setTipo] = useState<Tipo>('diario');
  const uma = umas.find((u) => u.anio === anio) ?? umas[0];
  const n = Number(cantidad.replace(/[^\d.]/g, ''));

  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
      <div className="space-y-4">
        <Input
          label="Número de UMA"
          inputMode="decimal"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          extra={<Ayuda texto="Multas, exenciones y topes se expresan en UMA. Ejemplo: el aguinaldo está exento hasta 30 UMA diarias." />}
        />
        <Segmentado
          label="Valor de la UMA"
          modo="fila"
          value={tipo}
          onChange={setTipo}
          options={[
            { value: 'diario', label: 'Diaria' },
            { value: 'mensual', label: 'Mensual' },
            { value: 'anual', label: 'Anual' },
          ]}
        />
        <Select
          label="Año"
          value={anio}
          onChange={setAnio}
          options={umas.map((u) => ({ value: u.anio, label: `${u.anio} (desde el 1 de febrero)` }))}
        />
      </div>
      <div aria-live="polite" className="flex flex-col justify-center">
        <p className="text-sm text-text-soft">Equivale a</p>
        <p className="text-4xl font-bold tabular-nums text-text">{n > 0 ? pesos(n * uma[tipo]) : '—'}</p>
        <p className="mt-1 text-sm text-text-soft">
          {n > 0 ? `${n.toLocaleString('es-MX')} × ${pesos(uma[tipo])} (UMA ${tipo === 'diario' ? 'diaria' : tipo} ${uma.anio})` : 'Escribe una cantidad de UMA.'}
        </p>
      </div>
    </section>
  );
}
