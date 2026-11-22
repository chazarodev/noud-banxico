/** Isotipo de Noud XML, en línea para no depender de rutas de /public con basePath. */
export function NoudMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="2 2 60 60" className={className} aria-hidden="true">
      <path
        d="M14 50V32A18 18 0 0 1 50 32V50"
        fill="none"
        stroke="#5C608A"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="14" cy="50" r="9.5" fill="#80BFA2" />
      <circle cx="50" cy="50" r="9.5" fill="#80BFA2" />
      <circle cx="32" cy="14" r="10" fill="#5D5ABF" />
    </svg>
  );
}
