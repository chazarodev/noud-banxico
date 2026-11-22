import type { Metadata } from 'next';
import Link from 'next/link';
import { Fuente } from '@/components/Fuente';
import { TarjetaNoud } from '@/components/TarjetaNoud';
import { Chispa } from '@/components/graficas/Chispa';
import { GraficaBarras } from '@/components/graficas/GraficaBarras';
import { GraficaLineas } from '@/components/graficas/GraficaLineas';
import { TablaDatos } from '@/components/graficas/TablaDatos';
import { formatoValor, mesLargo } from '@/components/graficas/formato';
import { datosTablero } from '@/lib/banxico/graficas';
import { fechaCorta } from '@/lib/banxico/parse';
import { url } from '@/lib/sitio';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'La economía de México hoy: dólar, inflación, tasas, remesas y reservas',
  description:
    'Tablero con los principales indicadores de México según Banxico: tipo de cambio, inflación, tasa objetivo, Cetes, remesas y reservas internacionales, con gráficas.',
  alternates: { canonical: url('/tablero') },
};

type Tile = {
  titulo: string;
  valor: string;
  detalle: string;
  chispa: number[];
  color: string;
  fondo: string;
  href?: string;
};

export default async function TableroPage() {
  const d = await datosTablero();
  const tvi = d.tasasVsInflacion;
  const ultInfl = d.inflacion.ultimo;
  const ultTasa = d.tasa.ultimo;
  const tasaReal = ultInfl && ultTasa ? ultTasa.valor - ultInfl.valor : null;

  // Remesas: acumulado del año vs. mismo periodo del año anterior.
  const rem = d.remesas.serie;
  const ultRem = rem.at(-1);
  let comparativo: { anio: number; actual: number; previo: number; meses: number } | null = null;
  if (ultRem) {
    const anio = Number(ultRem.mes.slice(0, 4));
    const mesFin = ultRem.mes.slice(5);
    const suma = (a: number) => rem.filter((p) => p.mes >= `${a}-01` && p.mes <= `${a}-${mesFin}`).reduce((s, p) => s + p.valor, 0);
    comparativo = { anio, actual: suma(anio), previo: suma(anio - 1), meses: Number(mesFin) };
  }
  const varRem = comparativo && comparativo.previo ? (comparativo.actual / comparativo.previo - 1) * 100 : null;

  const tiles: Tile[] = [
    d.fix.ultimo && {
      titulo: 'Dólar (FIX)',
      valor: formatoValor(d.fix.ultimo.valor, 'pesos'),
      detalle: `${fechaCorta(d.fix.ultimo.fecha)} · últimos 90 días`,
      chispa: d.fix.chispa,
      color: 'var(--serie-1)',
      fondo: 'bg-brand-light border-brand/40',
      href: '/dolar-historico',
    },
    ultInfl && {
      titulo: 'Inflación anual',
      valor: formatoValor(ultInfl.valor, 'porcentaje'),
      detalle: `${mesLargo(ultInfl.mes)} · 24 meses`,
      chispa: d.inflacion.chispa,
      color: 'var(--serie-2)',
      fondo: 'bg-danger-soft border-terracotta/40',
      href: '/inflacion',
    },
    ultTasa && {
      titulo: 'Tasa objetivo',
      valor: formatoValor(ultTasa.valor, 'porcentaje'),
      detalle: `Banxico · 24 meses`,
      chispa: d.tasa.chispa,
      color: 'var(--serie-3)',
      fondo: 'bg-info-soft border-info/30',
    },
    d.cetes.ultimo && {
      titulo: 'Cetes a 91 días',
      valor: formatoValor(d.cetes.ultimo.valor, 'porcentaje'),
      detalle: `Subasta del ${fechaCorta(d.cetes.ultimo.fecha)}`,
      chispa: d.cetes.chispa,
      color: 'var(--serie-4)',
      fondo: 'bg-warning-soft border-sand/60',
    },
    ultRem && {
      titulo: 'Remesas del mes',
      valor: formatoValor(ultRem.valor, 'millonesUsd'),
      detalle: `${mesLargo(ultRem.mes)} · 24 meses`,
      chispa: d.remesas.chispa,
      color: 'var(--serie-1)',
      fondo: 'bg-brand-light border-brand/40',
    },
    d.reservas.ultimo && {
      titulo: 'Reservas internacionales',
      valor: formatoValor(d.reservas.ultimo.valor, 'millonesUsd', true),
      detalle: `${fechaCorta(d.reservas.ultimo.fecha)} · 24 meses`,
      chispa: d.reservas.chispa,
      color: 'var(--serie-3)',
      fondo: 'bg-info-soft border-info/30',
    },
  ].filter(Boolean) as Tile[];

  const pm = (xs: { mes: string; valor: number }[]) => xs.map((p) => ({ x: p.mes, valor: p.valor }));
  const mapa = (xs: { mes: string; valor: number }[]) => new Map(xs.map((p) => [p.mes, p.valor]));
  const [mT, mC, mI] = [mapa(tvi.tasa), mapa(tvi.cetes), mapa(tvi.inflacion)];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-sm font-medium text-brand-ink">Gráficas · Tablero</p>
      <h1 className="mt-1 text-3xl font-semibold text-text">La economía de México hoy</h1>
      <p className="mt-2 max-w-3xl text-text-soft">
        Los indicadores que más se siguen, con datos del Banco de México.
        {tasaReal !== null && ultInfl && ultTasa
          ? ` La tasa objetivo (${formatoValor(ultTasa.valor, 'porcentaje')}) está ${Math.abs(tasaReal).toFixed(2)} puntos ${tasaReal >= 0 ? 'por encima' : 'por debajo'} de la inflación anual de ${mesLargo(ultInfl.mes)}.`
          : ''}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const contenido = (
            <>
              <p className="text-sm text-text-soft">{t.titulo}</p>
              <p className="mt-1 text-3xl font-bold text-text">{t.valor}</p>
              <Chispa valores={t.chispa} color={t.color} className="mt-2 h-10 w-full" />
              <p className="mt-1 text-xs text-text-soft">{t.detalle}</p>
            </>
          );
          const clases = `rounded-2xl border p-4 ${t.fondo}`;
          return t.href ? (
            <Link key={t.titulo} href={t.href} className={`${clases} transition hover:shadow-md`}>
              {contenido}
            </Link>
          ) : (
            <div key={t.titulo} className={clases}>
              {contenido}
            </div>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Tasas de interés contra inflación</h2>
        <p className="mb-4 text-sm text-text-soft">
          Cuando la tasa está por encima de la inflación, el rendimiento real de los Cetes es positivo. Datos mensuales
          desde 2018.
        </p>
        <GraficaLineas
          titulo="Tasa objetivo, Cetes a 91 días e inflación anual desde 2018"
          unidad="porcentaje"
          eje="mes"
          series={[
            { clave: 'tasa', nombre: 'Tasa objetivo', color: 'var(--serie-3)', puntos: pm(tvi.tasa) },
            { clave: 'cetes', nombre: 'Cetes 91 días', color: 'var(--serie-4)', puntos: pm(tvi.cetes) },
            { clave: 'inflacion', nombre: 'Inflación anual', color: 'var(--serie-2)', puntos: pm(tvi.inflacion) },
          ]}
        />
        <TablaDatos
          columnas={['Tasa objetivo', 'Cetes 91', 'Inflación']}
          unidad="porcentaje"
          eje="mes"
          filas={tvi.tasa.map((p) => ({ x: p.mes, valores: [mT.get(p.mes), mC.get(p.mes), mI.get(p.mes)] }))}
        />
        <Fuente serieId="SF61745, SF60634 y SP30578" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Remesas familiares por mes</h2>
          <p className="text-xs text-text-soft">Millones de dólares. En el eje, “6 mil” son 6,000 millones.</p>
          {comparativo && varRem !== null && (
            <p className="mb-4 text-sm text-text-soft">
              De enero a {mesLargo(rem.at(-1)!.mes).split(' de ')[0]} de {comparativo.anio} llegaron{' '}
              <strong className="text-text">{formatoValor(comparativo.actual, 'millonesUsd')}</strong>,{' '}
              {Math.abs(varRem).toFixed(1)}% {varRem >= 0 ? 'más' : 'menos'} que en el mismo periodo de {comparativo.anio - 1}.
            </p>
          )}
          <GraficaBarras
            titulo="Remesas familiares mensuales, millones de dólares, últimos 36 meses"
            unidad="millonesUsd"
            eje="mes"
            color="var(--serie-1)"
            puntos={pm(rem.slice(-36))}
          />
          <TablaDatos columnas={['Millones de dólares']} unidad="millonesUsd" eje="mes" filas={rem.slice(-36).map((p) => ({ x: p.mes, valores: [p.valor] }))} />
          <Fuente serieId="SE27803" />
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Reservas internacionales</h2>
          <p className="mb-4 text-sm text-text-soft">Saldo al cierre de cada mes desde 2018, millones de dólares.</p>
          <GraficaLineas
            titulo="Reservas internacionales de México desde 2018"
            unidad="millonesUsd"
            eje="mes"
            altura={280}
            series={[{ clave: 'reservas', nombre: 'Reservas', color: 'var(--serie-3)', puntos: pm(d.reservas.serie.filter((p) => p.mes >= '2018-01')) }]}
          />
          <TablaDatos
            columnas={['Millones de dólares']}
            unidad="millonesUsd"
            eje="mes"
            filas={d.reservas.serie.filter((p) => p.mes >= '2018-01').map((p) => ({ x: p.mes, valores: [p.valor] }))}
          />
          <Fuente serieId="SF43707" />
        </section>
      </div>

      <TarjetaNoud
        titulo="Los números de tu negocio, igual de claros"
        texto="Noud XML convierte tus CFDI en papeles de trabajo: cuentas por pagar y cobrar, flujo de efectivo, IVA, ISR y DIOT."
        campana="tablero"
        ubicacion="final"
      />
    </main>
  );
}
