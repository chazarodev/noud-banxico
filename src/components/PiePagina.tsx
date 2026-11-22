import Link from 'next/link';
import { NoudMark } from '@/components/NoudMark';
import { NOUD, conUtm, enlaceNoud } from '@/lib/sitio';

export function PiePagina() {
  return (
    <footer className="mt-20 border-t border-border bg-card">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <NoudMark className="h-6 w-6" />
            <span className="font-semibold text-text">Noud XML</span>
          </div>
          <p className="mt-3 text-text-soft">
            Auxiliar contable que convierte tus XML de CFDI en papeles de trabajo: cuentas por pagar y cobrar,
            DIOT y pagos provisionales.
          </p>
          <a
            href={enlaceNoud('pie', 'texto-registro')}
            data-evento="click_noud"
            data-ubicacion="pie"
            className="mt-3 inline-block font-medium text-brand-ink hover:underline"
          >
            Empieza gratis →
          </a>
        </div>

        <div>
          <p className="font-semibold text-text">Indicadores</p>
          <ul className="mt-3 space-y-2 text-text-soft">
            <li>
              <Link href="/" className="hover:text-text">Todos los indicadores</Link>
            </li>
            <li>
              <Link href="/tipo-de-cambio" className="hover:text-text">Tipo de cambio DOF hoy</Link>
            </li>
            <li>
              <Link href="/convertidor-dolares-pesos" className="hover:text-text">Convertidor de dólares a pesos</Link>
            </li>
            <li>
              <Link href="/calculadora-aguinaldo" className="hover:text-text">Calculadora de aguinaldo 2026</Link>
            </li>
            <li>
              <Link href="/verificador-tipo-cambio-cfdi" className="hover:text-text">Verificador de tipo de cambio en CFDI</Link>
            </li>
            <li>
              <Link href="/calculadora-iva-retenciones" className="hover:text-text">IVA y retenciones al facturar</Link>
            </li>
            <li>
              <Link href="/calculadora-actualizacion-recargos" className="hover:text-text">Actualización y recargos SAT</Link>
            </li>
            <li>
              <Link href="/calculadora-isr-salarios" className="hover:text-text">Calculadora de ISR por sueldos</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-text">Noud XML</p>
          <ul className="mt-3 space-y-2 text-text-soft">
            <li><a href={conUtm(NOUD.inicio, 'pie', 'inicio')} className="hover:text-text">Inicio</a></li>
            <li><a href={conUtm(NOUD.planes, 'pie', 'planes')} className="hover:text-text">Planes</a></li>
            <li><a href={NOUD.login} className="hover:text-text">Iniciar sesión</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-5xl px-4 py-6 text-xs text-text-soft">
          Datos: Banco de México, Sistema de Información Económica (SIE), con fines informativos. Pueden diferir de
          las cifras definitivas. Este sitio no está afiliado al Banco de México ni al Diario Oficial de la
          Federación. © {new Date().getFullYear()} Noud XML.
        </p>
      </div>
    </footer>
  );
}
