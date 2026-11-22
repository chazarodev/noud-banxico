// A diferencia de layout.tsx, template.tsx se vuelve a montar en cada navegación:
// por eso su animación de entrada se reproduce cada vez que cambias de página.
// Encabezado y pie viven en el layout, así que se quedan quietos y solo "entra" el contenido.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="entrada-pagina">{children}</div>;
}
