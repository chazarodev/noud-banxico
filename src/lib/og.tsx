import { ImageResponse } from 'next/og';

// Plantilla de las imágenes para compartir (Open Graph): 1200×630, colores de Noud XML.
// Satori (el motor de next/og) solo admite flexbox: todo div con varios hijos lleva display: 'flex'.
export const tamanoOg = { width: 1200, height: 630 };
export const tipoOg = 'image/png';

type Datos = { etiqueta: string; titulo: string; valor?: string; detalle?: string };

export function imagenOg({ etiqueta, titulo, valor, detalle }: Datos) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#FAF9F6',
          color: '#1F2147',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="56" height="56" viewBox="2 2 60 60">
            <path d="M14 50V32A18 18 0 0 1 50 32V50" fill="none" stroke="#5C608A" strokeWidth="7" strokeLinecap="round" />
            <circle cx="14" cy="50" r="9.5" fill="#80BFA2" />
            <circle cx="50" cy="50" r="9.5" fill="#80BFA2" />
            <circle cx="32" cy="14" r="10" fill="#5D5ABF" />
          </svg>
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 700 }}>
            Noud<span style={{ fontWeight: 400, color: '#5C608A', marginLeft: 10 }}>· Indicadores</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 28, color: '#2F6B4F', fontWeight: 600 }}>{etiqueta}</div>
          <div style={{ display: 'flex', fontSize: valor ? 52 : 68, fontWeight: 700, lineHeight: 1.1, marginTop: 8 }}>{titulo}</div>
          {valor && <div style={{ display: 'flex', fontSize: 120, fontWeight: 800, marginTop: 12 }}>{valor}</div>}
          {detalle && <div style={{ display: 'flex', fontSize: 30, color: '#5C608A', marginTop: 12 }}>{detalle}</div>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, color: '#5C608A' }}>
          <div style={{ display: 'flex' }}>noudxml.com/indicadores</div>
          <div style={{ display: 'flex', background: '#80BFA2', color: '#1F2147', padding: '10px 22px', borderRadius: 16, fontWeight: 600 }}>
            Datos oficiales de Banxico
          </div>
        </div>
      </div>
    ),
    tamanoOg,
  );
}
