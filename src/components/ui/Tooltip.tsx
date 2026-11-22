"use client";

import { ReactNode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { Info } from "lucide-react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}


const MARGEN = 8; // separación entre el elemento y el tooltip
const BORDE = 6; // distancia mínima al borde de la ventana
const TACTIL_MS = 2200; // en pantallas táctiles no hay "hover": se muestra un momento al tocar

// Adaptado del Tooltip de Noud XML: fondo bg-card (funciona en tema oscuro) y texto en tipo oración.

/**
 * Tooltip sin dependencias. Antes envolvía a sus hijos en el <button> de un Popover de Headless UI:
 *  - cualquier <Button>, <Link> o <a> como hijo quedaba anidado en otro botón (HTML inválido, error de hidratación);
 *  - el "hover" se simulaba haciendo btn.click(), que en táctil se cancela solo (el toque dispara mouseenter + click)
 *    y si el usuario hacía clic con el cursor encima, el estado se invertía;
 *  - no se mostraba con el teclado.
 * Ahora el hijo va dentro de un <span> inerte, el panel se pinta en un portal (no lo recorta un overflow del padre)
 * y se reposiciona solo para no salirse de la pantalla.
 */
export function Tooltip({ children, content, className }: TooltipProps) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; arriba: boolean; flecha: number } | null>(null);
  const disparador = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const abrir = useCallback(() => setAbierto(true), []);
  const cerrar = useCallback(() => {
    clearTimeout(temporizador.current);
    setAbierto(false);
    setPos(null);
  }, []);

  // El panel se monta invisible, se mide y entonces se coloca: arriba si cabe, abajo si no.
  useLayoutEffect(() => {
    if (!abierto || !disparador.current || !panel.current) return;
    const t = disparador.current.getBoundingClientRect();
    const p = panel.current.getBoundingClientRect();

    let arriba = true;
    let top = t.top - p.height - MARGEN;
    if (top < BORDE) {
      arriba = false;
      top = t.bottom + MARGEN;
    }

    const centro = t.left + t.width / 2;
    const left = Math.max(BORDE, Math.min(centro - p.width / 2, window.innerWidth - p.width - BORDE));
    setPos({ top, left, arriba, flecha: centro - left });
  }, [abierto, content]);

  // Cierra con Escape, y al hacer scroll o redimensionar (la posición calculada ya no sería la correcta).
  useEffect(() => {
    if (!abierto) return;
    const alMover = () => cerrar();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("scroll", alMover, true);
    window.addEventListener("resize", alMover);
    window.addEventListener("keydown", alTeclear);
    return () => {
      window.removeEventListener("scroll", alMover, true);
      window.removeEventListener("resize", alMover);
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierto, cerrar]);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return (
    <>
      <span
        ref={disparador}
        // Un <button disabled> no emite eventos de puntero: con esto los recibe el <span> y el tooltip funciona también sobre botones deshabilitados.
        className={clsx("inline-flex items-center justify-center [&>*:disabled]:pointer-events-none", className)}
        onPointerEnter={(e) => e.pointerType === "mouse" && abrir()}
        onPointerLeave={(e) => e.pointerType === "mouse" && cerrar()}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          abrir();
          clearTimeout(temporizador.current);
          temporizador.current = setTimeout(cerrar, TACTIL_MS);
        }}
        // Solo con teclado (focus-visible): un clic con el mouse también enfoca el botón y no debe dejar el tooltip pegado.
        onFocus={(e) => (e.target as HTMLElement).matches(":focus-visible") && abrir()}
        onBlur={cerrar}
      >
        {children}
      </span>

      {abierto &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="tooltip"
            style={{ position: "fixed", top: pos?.top ?? 0, left: pos?.left ?? 0 }}
            className={clsx(
              "pointer-events-none z-100 px-2.5 py-1 rounded-lg shadow-md",
              // Los mensajes largos (explican por qué una acción está bloqueada) se parten en líneas en vez de salirse de la pantalla.
              "max-w-[18rem] whitespace-normal text-center leading-snug",
              "bg-card text-text border border-border text-xs font-medium",
              "transition duration-150 ease-out",
              pos ? "opacity-100 scale-100" : "opacity-0 scale-95",
              pos?.arriba === false ? "origin-top" : "origin-bottom"
            )}
          >
            {content}
            <div
              aria-hidden="true"
              style={{ left: pos?.flecha ?? 0 }}
              className={clsx(
                "absolute w-2 h-2 bg-card border-border rotate-45 -translate-x-1/2",
                pos?.arriba === false ? "-top-[4px] border-l border-t" : "-bottom-[4px] border-r border-b"
              )}
            />
          </div>,
          document.body
        )}
    </>
  );
}

/** Ícono "i" con tooltip, para explicar un término junto a una etiqueta. Accesible con teclado. */
export function Ayuda({ texto }: { texto: string }) {
  return (
    <Tooltip content={texto}>
      <button
        type="button"
        aria-label={texto}
        className="flex h-4 w-4 items-center justify-center rounded-full text-text-soft hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Info size={14} />
      </button>
    </Tooltip>
  );
}
