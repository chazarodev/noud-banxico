import type { Metadata } from 'next';
import { CalculadoraInflacion } from '@/components/CalculadoraInflacion';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { GraficaInflacion } from '@/components/graficas/GraficaInflacion';
import { mesLargo } from '@/components/graficas/formato';
import { datosInflacion } from '@/lib/banxico/graficas';
import { url } from '@/lib/sitio';

export const revalidate = 3600;
const pct = (n: number) => `${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

export async function generateMetadata(): Promise<Metadata> {
  const d = await datosInflacion();
  const u = d.general.at(-1);
  return {
    title: u ? `Inflación en México: ${pct(u.valor)} anual en ${mesLargo(u.mes)}` : 'Inflación en México hoy',
    description:
      'Inflación anual general y subyacente en México con gráfica histórica y calculadora para saber cuánto vale hoy el dinero de otros años.',
    alternates: { canonical: url('/inflacion') },
  };
}

export default async function InflacionPage() {
  const d = await datosInflacion();
  const g = d.general.at(-1);
  const gPrev = d.general.at(-2);
  const s = d.subyacente.at(-1);
  if (!g) return <main className="mx-auto max-w-5xl px-4 py-10">Datos no disponibles por ahora.</main>;

  const tendencia = gPrev ? (g.valor < gPrev.valor ? 'menor' : g.valor > gPrev.valor ? 'mayor' : 'igual') : null;
  const enMeta = g.valor >= 2 && g.valor <= 4;

  const tiles = [
    { titulo: 'Inflación anual', valor: pct(g.valor), detalle: mesLargo(g.mes), fondo: 'bg-danger-soft', borde: 'border-terracotta/40' },
    s && { titulo: 'Inflación subyacente', valor: pct(s.valor), detalle: 'Sin precios agropecuarios ni energéticos', fondo: 'bg-info-soft', borde: 'border-info/30' },
    d.mensual !== null && { titulo: 'Variación mensual', valor: pct(d.mensual), detalle: 'Respecto al mes anterior', fondo: 'bg-warning-soft', borde: 'border-sand/60' },
    { titulo: 'Meta de Banxico', valor: '3%', detalle: '± 1 punto porcentual', fondo: 'bg-brand-light', borde: 'border-brand/40' },
  ].filter(Boolean) as { titulo: string; valor: string; detalle: string; fondo: string; borde: string }[];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm font-medium text-brand-ink">Gráficas · INPC</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">Inflación en México</h1>
      <p className="mt-2 max-w-3xl text-text-soft">
        La inflación anual fue de <strong className="text-text">{pct(g.valor)}</strong> en {mesLargo(g.mes)}
        {tendencia && gPrev ? `, ${tendencia === 'igual' ? 'igual a' : `${tendencia} que`} la de ${mesLargo(gPrev.mes)} (${pct(gPrev.valor)})` : ''}
        {enMeta ? ', dentro del intervalo de la meta de Banxico.' : ', fuera del intervalo de 2 % a 4 % de la meta de Banxico.'}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.titulo} className={`rounded-2xl border p-4 ${t.fondo} ${t.borde}`}>
            <p className="text-sm text-text-soft">{t.titulo}</p>
            <p className="mt-1 text-3xl font-bold text-text">{t.valor}</p>
            <p className="mt-1 text-xs text-text-soft">{t.detalle}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Inflación anual: general y subyacente</h2>
        <p className="mb-4 text-sm text-text-soft">Variación anual del INPC, mensual. La franja verde es el intervalo de la meta de Banxico.</p>
        <GraficaInflacion general={d.general} subyacente={d.subyacente} />
        <Fuente serieId="SP30578 y SP74625" />
      </section>

      <h2 className="mt-12 text-xl font-semibold text-text">¿Cuánto vale hoy tu dinero de otros años?</h2>
      <p className="mb-4 mt-1 text-sm text-text-soft">Actualiza cualquier cantidad con la inflación entre dos meses.</p>
      <CalculadoraInflacion indice={d.indice} />
      <Fuente serieId="SP1" />

      <section className="mt-10 max-w-3xl space-y-3 text-sm text-text-soft">
        <h2 className="text-xl font-semibold text-text">General y subyacente: ¿cuál es la diferencia?</h2>
        <p>
          La inflación general mide cómo cambian los precios de toda la canasta del INPC. La subyacente excluye los
          productos más volátiles, como frutas, verduras y energéticos, y por eso refleja mejor la tendencia de fondo.
          Banxico sigue las dos para decidir su tasa de interés.
        </p>
      </section>

      <TarjetaNoud
        titulo="Actualiza tus contribuciones sin calcular a mano"
        texto="Noud XML prepara tus papeles de trabajo de IVA e ISR a partir de tus CFDI."
        campana="inflacion"
        ubicacion="final"
      />
    </main>
  );
}
