/** Mini gráfica de línea (sparkline) en SVG, renderizada en el servidor. Sin ejes: solo la forma. */
export function Chispa({ valores, color = 'var(--serie-1)', className = 'h-10 w-full' }: { valores: number[]; color?: string; className?: string }) {
  if (valores.length < 2) return null;
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const puntos = valores
    .map((v, i) => `${((i / (valores.length - 1)) * 100).toFixed(2)},${(28 - ((v - min) / rango) * 24).toFixed(2)}`)
    .join(' ');
  return (
    <svg viewBox="-2 0 104 32" preserveAspectRatio="none" className={className} aria-hidden>
      <polyline points={puntos} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
