"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildLarynx, PALETTE } from "./build-larynx";

/**
 * Visor 3D de la laringe.
 *
 * Decisiones de costo: se renderiza al devicePixelRatio real (capado en 2) para
 * verse nítido en pantallas Retina y 4K sin rasterizar de más; el bucle se detiene
 * cuando el canvas sale de pantalla o la pestaña pasa a segundo plano; y con
 * `prefers-reduced-motion` la pieza se muestra quieta en lugar de girar.
 */
export default function LarynxCanvas({ modelUrl }: { modelUrl?: string | null }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // Sin WebGL no mostramos nada: el hero funciona igual.
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.1, 6.1);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    // Luz: un key azul clínico y un rim dorado, coherentes con la paleta.
    scene.add(new THREE.AmbientLight(PALETTE.paper, 0.35));

    const key = new THREE.DirectionalLight(PALETTE.clinicLight, 2.6);
    key.position.set(2.4, 2.8, 3.2);
    scene.add(key);

    const rim = new THREE.DirectionalLight(PALETTE.gold, 1.9);
    rim.position.set(-2.8, 0.6, -2.4);
    scene.add(rim);

    const fill = new THREE.PointLight(PALETTE.clinic, 9, 14);
    fill.position.set(-1.6, -1.4, 2.2);
    scene.add(fill);

    const pivot = new THREE.Group();
    scene.add(pivot);

    const built = buildLarynx();
    let disposeModel = built.dispose;
    pivot.add(built.group);
    setReady(true);

    // Si hay un modelo propio cargado desde /admin, reemplaza al procedimental.
    let cancelled = false;
    let draco: import("three/examples/jsm/loaders/DRACOLoader.js").DRACOLoader | null = null;
    if (modelUrl) {
      void (async () => {
        try {
          const [{ GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }] = await Promise.all([
            import("three/examples/jsm/loaders/GLTFLoader.js"),
            import("three/examples/jsm/loaders/DRACOLoader.js"),
            import("three/examples/jsm/libs/meshopt_decoder.module.js"),
          ]);

          // Los modelos optimizados llegan comprimidos con meshopt o con Draco,
          // según la herramienta que se haya usado: se soportan los dos.
          // El decodificador de Draco se sirve desde /draco, no desde un CDN externo,
          // y sólo se descarga si el modelo realmente lo necesita.
          draco = new DRACOLoader().setDecoderPath("/draco/");
          const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).setDRACOLoader(draco);
          const gltf = await loader.loadAsync(modelUrl);
          if (cancelled) return;

          // Escala el modelo para que ocupe el mismo volumen que la pieza propia.
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);
          // 3.4 deja margen: el alto visible a esta distancia es ~3.7 unidades.
          const scale = 3.4 / Math.max(size.x, size.y, size.z || 1);
          gltf.scene.scale.setScalar(scale);
          gltf.scene.position.sub(center.multiplyScalar(scale));

          pivot.remove(built.group);
          disposeModel();
          disposeModel = () => {
            gltf.scene.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (mesh.geometry) mesh.geometry.dispose();
              const material = mesh.material;
              if (Array.isArray(material)) material.forEach((m) => m.dispose());
              else if (material) (material as THREE.Material).dispose();
            });
          };
          pivot.add(gltf.scene);
        } catch (error) {
          // El modelo propio falló: se queda la pieza procedimental, pero el motivo
          // tiene que quedar visible o el problema parece "no pasa nada".
          console.error(
            "[ETVEK] No se pudo cargar el modelo 3D del hero; se usa la pieza por defecto.",
            error,
          );
        }
      })();
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Interacción: arrastrar para girar, sin secuestrar el scroll.
    let dragging = false;
    let lastX = 0;
    let velocity = 0;
    let manualY = 0;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      renderer.domElement.setPointerCapture(event.pointerId);
      renderer.domElement.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const delta = (event.clientX - lastX) / 180;
      lastX = event.clientX;
      manualY += delta;
      velocity = delta;
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      renderer.domElement.style.cursor = "grab";
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);

    const resize = () => {
      const { clientWidth, clientHeight } = host;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // El bucle sólo corre si el canvas está a la vista y la pestaña está activa.
    let visible = true;
    let onScreen = true;
    let frame = 0;
    let elapsed = 0;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;

      if (!reduceMotion.matches) {
        if (!dragging) {
          manualY += velocity;
          velocity *= 0.94;
          manualY += delta * 0.26; // giro lento y continuo
        }
        // Cabeceo muy leve, para que no parezca un GIF en bucle.
        pivot.rotation.x = Math.sin(elapsed * 0.35) * 0.07;
      }

      pivot.rotation.y = manualY;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (frame) return;
      clock.getDelta();
      frame = requestAnimationFrame(renderFrame);
    };
    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (visible && onScreen ? start() : stop());

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" },
    );
    intersectionObserver.observe(host);

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMotionChange = () => renderer.render(scene, camera);
    reduceMotion.addEventListener("change", onMotionChange);

    sync();
    renderer.render(scene, camera);

    return () => {
      cancelled = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", onMotionChange);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      disposeModel();
      draco?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [modelUrl]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`size-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
