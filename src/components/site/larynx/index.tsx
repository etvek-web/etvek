"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// three.js pesa: se carga aparte y sólo cuando se va a mostrar, para no tocar
// el bundle inicial ni el LCP del hero.
const LarynxCanvas = dynamic(() => import("./larynx-canvas"), { ssr: false, loading: () => null });

/**
 * Decide si conviene montar el visor 3D.
 *
 * Queda fuera en pantallas chicas (la mayoría llega desde Instagram o WhatsApp),
 * con "ahorro de datos" activado, o si el navegador no soporta WebGL. En esos
 * casos el hero se ve exactamente como antes.
 */
function useShouldRender() {
  const [should, setShould] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");

    const evaluate = () => {
      if (!query.matches) return setShould(false);

      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (connection?.saveData) return setShould(false);

      const canvas = document.createElement("canvas");
      const supportsWebgl = Boolean(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
      );
      setShould(supportsWebgl);
    };

    evaluate();
    query.addEventListener("change", evaluate);
    return () => query.removeEventListener("change", evaluate);
  }, []);

  return should;
}

export function LarynxViewer({ modelUrl }: { modelUrl?: string | null }) {
  const should = useShouldRender();
  if (!should) return null;
  return <LarynxCanvas modelUrl={modelUrl} />;
}
