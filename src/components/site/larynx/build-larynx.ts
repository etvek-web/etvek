import * as THREE from "three";

/**
 * Laringe estilizada, construida por código.
 *
 * No es un escaneo médico. Está resuelta como lámina de estudio: una superficie
 * continua que traza la silueta del órgano —tráquea, cricoides, prominencia
 * tiroidea y vestíbulo— dibujada con contornos de trazo fino, más las estructuras
 * que la vuelven reconocible (pliegues vocales, aritenoides, epiglotis).
 *
 * Toda la geometría sale de `surfacePoint`, así que los contornos y la superficie
 * nunca se desalinean.
 *
 * Si se carga un modelo .glb desde /admin, este procedimiento no se usa.
 */

export const PALETTE = {
  ink: 0x111111,
  clinic: 0x005a9c,
  clinicLight: 0x2a7fc0,
  gold: 0xc5a059,
  paper: 0xffffff,
};

const Y_BOTTOM = -2.15;
const Y_TOP = 1.05;

/** Interpola el radio base siguiendo el perfil real del órgano. */
function baseRadius(y: number) {
  const stops: [number, number][] = [
    [-2.15, 0.46],
    [-1.55, 0.475],
    [-1.05, 0.49],
    [-0.92, 0.6], // cricoides
    [-0.62, 0.61],
    [-0.44, 0.52], // cintura bajo la glotis
    [-0.12, 0.56],
    [0.2, 0.72], // cuerpo del tiroides
    [0.55, 0.78],
    [0.8, 0.74],
    [1.05, 0.62], // borde superior
  ];

  for (let i = 0; i < stops.length - 1; i += 1) {
    const [y0, r0] = stops[i];
    const [y1, r1] = stops[i + 1];
    if (y <= y1 || i === stops.length - 2) {
      const t = THREE.MathUtils.clamp((y - y0) / (y1 - y0), 0, 1);
      return THREE.MathUtils.lerp(r0, r1, t * t * (3 - 2 * t)); // suavizado
    }
  }
  return stops[stops.length - 1][1];
}

/** Un punto de la superficie. theta = 0 es el frente (prominencia laríngea). */
function surfacePoint(y: number, theta: number, target = new THREE.Vector3()) {
  const front = Math.cos(theta); // 1 adelante, -1 atrás
  let r = baseRadius(y);

  // Prominencia laríngea: el frente se proyecta en ángulo entre la glotis y el borde superior.
  const prominence = Math.exp(-Math.pow((y - 0.42) / 0.62, 2));
  const frontPush = front > 0 ? Math.pow(front, 1.6) * prominence * 0.3 : 0;

  // Lámina posterior del cricoides: atrás el anillo sube y se aplana.
  const backPlate = front < 0 ? Math.exp(-Math.pow((y + 0.62) / 0.34, 2)) * Math.pow(-front, 2) * 0.1 : 0;

  r += backPlate;

  // Sección algo más ancha que profunda, como el órgano real.
  const x = Math.sin(theta) * r * 1.06;
  const z = front * r + frontPush;

  return target.set(x, y, z);
}

/** Escotadura tiroidea: el borde superior baja en el frente. */
function topEdge(theta: number) {
  const front = Math.max(0, Math.cos(theta));
  return Y_TOP - Math.pow(front, 2) * 0.26;
}

type Built = { group: THREE.Group; dispose: () => void };

export function buildLarynx(): Built {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const RADIAL = 72;

  // ── Superficie continua del órgano ────────────────────────────────────────
  const rows = 46;
  const positions: number[] = [];
  const indices: number[] = [];
  const point = new THREE.Vector3();

  for (let i = 0; i <= rows; i += 1) {
    const v = i / rows;
    for (let j = 0; j <= RADIAL; j += 1) {
      const theta = (j / RADIAL) * Math.PI * 2;
      const y = THREE.MathUtils.lerp(Y_BOTTOM, topEdge(theta), v);
      surfacePoint(y, theta, point);
      positions.push(point.x, point.y, point.z);
    }
  }
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < RADIAL; j += 1) {
      const a = i * (RADIAL + 1) + j;
      const b = a + RADIAL + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const bodyGeometry = track(new THREE.BufferGeometry());
  bodyGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  bodyGeometry.setIndex(indices);
  bodyGeometry.computeVertexNormals();

  // Alfa por vértice: la tráquea se apaga hacia abajo en lugar de cortarse.
  const bodyAlpha: number[] = [];
  for (let i = 0; i < positions.length; i += 3) {
    const y = positions[i + 1];
    const fade = THREE.MathUtils.smoothstep(y, Y_BOTTOM, Y_BOTTOM + 0.85);
    bodyAlpha.push(1, 1, 1, fade);
  }
  bodyGeometry.setAttribute("color", new THREE.Float32BufferAttribute(bodyAlpha, 4));

  group.add(
    new THREE.Mesh(
      bodyGeometry,
      track(
        new THREE.MeshStandardMaterial({
          color: PALETTE.clinic,
          transparent: true,
          opacity: 0.17,
          roughness: 0.6,
          metalness: 0.05,
          side: THREE.DoubleSide,
          depthWrite: false,
          vertexColors: true,
        }),
      ),
    ),
  );

  // ── Contornos horizontales: el trazo que da lectura de lámina anatómica.
  const contourMaterial = track(
    new THREE.LineBasicMaterial({ color: PALETTE.clinicLight, transparent: true, opacity: 0.55, depthWrite: false }),
  );
  const contourSoft = track(
    new THREE.LineBasicMaterial({ color: PALETTE.clinicLight, transparent: true, opacity: 0.22, depthWrite: false }),
  );

  const contourHeights = [
    -2.05, -1.8, -1.55, -1.3, -1.05, -0.92, -0.78, -0.62, -0.44, -0.24, -0.06, 0.14, 0.34, 0.54, 0.74, 0.92,
  ];
  for (const y of contourHeights) {
    const ring: THREE.Vector3[] = [];
    for (let j = 0; j <= RADIAL; j += 1) {
      const theta = (j / RADIAL) * Math.PI * 2;
      // Ningún contorno debe sobrepasar el borde superior recortado.
      ring.push(surfacePoint(Math.min(y, topEdge(theta) - 0.01), theta, new THREE.Vector3()));
    }
    const geometry = track(new THREE.BufferGeometry().setFromPoints(ring));
    // Los anillos traqueales y el cricoides se marcan más que el resto.
    const emphasised = Math.abs(y + 0.7) < 0.2 || Math.abs(y - 0.54) < 0.12;
    const fading = y < -1.25;
    group.add(
      new THREE.Line(
        geometry,
        fading
          ? track(
              new THREE.LineBasicMaterial({
                color: PALETTE.clinicLight,
                transparent: true,
                opacity: Math.max(0.04, 0.34 + (y + 1.25) * 0.36),
                depthWrite: false,
              }),
            )
          : emphasised
            ? contourMaterial
            : contourSoft,
      ),
    );
  }

  // Meridianos, pocos, para dar volumen sin ensuciar.
  for (let k = 0; k < 12; k += 1) {
    const theta = (k / 12) * Math.PI * 2;
    const meridian: THREE.Vector3[] = [];
    const top = topEdge(theta);
    for (let i = 0; i <= 40; i += 1) {
      meridian.push(surfacePoint(THREE.MathUtils.lerp(Y_BOTTOM, top, i / 40), theta, new THREE.Vector3()));
    }
    group.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(meridian)), contourSoft));
  }

  // Borde superior con la escotadura tiroidea, remarcado.
  const topRing: THREE.Vector3[] = [];
  for (let j = 0; j <= RADIAL; j += 1) {
    const theta = (j / RADIAL) * Math.PI * 2;
    topRing.push(surfacePoint(topEdge(theta), theta, new THREE.Vector3()));
  }
  group.add(
    new THREE.Line(
      track(new THREE.BufferGeometry().setFromPoints(topRing)),
      track(new THREE.LineBasicMaterial({ color: PALETTE.paper, transparent: true, opacity: 0.4, depthWrite: false })),
    ),
  );

  // ── Pliegues vocales: dos cuñas doradas con la glotis abierta entre ambas.
  const foldMaterial = track(
    new THREE.MeshStandardMaterial({
      color: PALETTE.gold,
      transparent: true,
      opacity: 0.82,
      roughness: 0.32,
      metalness: 0.25,
      emissive: new THREE.Color(PALETTE.gold),
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide,
    }),
  );

  for (const side of [1, -1]) {
    // El contorno se define en el plano horizontal (x, z): del ángulo del
    // tiroides, adelante, hacia el aritenoides, atrás.
    const fold = new THREE.Shape();
    // La glotis es una V que se abre hacia atrás: el borde medial se separa
    // del eje a medida que avanza hacia los aritenoides.
    fold.moveTo(0.022, 0.4); // ángulo del tiroides, casi en contacto
    fold.lineTo(0.075, 0.42);
    fold.lineTo(0.27, -0.3); // borde lateral, atrás
    fold.lineTo(0.15, -0.28); // borde medial, ya separado: abre la glotis
    fold.lineTo(0.022, 0.4);

    const geometry = track(
      new THREE.ExtrudeGeometry(fold, {
        depth: 0.055,
        bevelEnabled: true,
        bevelSize: 0.014,
        bevelThickness: 0.014,
        bevelSegments: 2,
        curveSegments: 4,
      }),
    );
    // Acuesta la cuña: el grosor pasa a ser vertical.
    geometry.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geometry, foldMaterial);
    mesh.scale.x = side;
    mesh.position.set(0, -0.14, 0);
    group.add(mesh);
  }

  // ── Aritenoides: sobre la lámina posterior del cricoides.
  for (const side of [1, -1]) {
    const arytenoid = track(new THREE.ConeGeometry(0.085, 0.2, 4, 1));
    const mesh = new THREE.Mesh(
      arytenoid,
      track(
        new THREE.MeshStandardMaterial({
          color: PALETTE.clinicLight,
          transparent: true,
          opacity: 0.38,
          roughness: 0.5,
          side: THREE.DoubleSide,
        }),
      ),
    );
    mesh.add(
      new THREE.LineSegments(
        track(new THREE.EdgesGeometry(arytenoid, 20)),
        track(new THREE.LineBasicMaterial({ color: PALETTE.gold, transparent: true, opacity: 0.45 })),
      ),
    );
    mesh.position.set(side * 0.14, -0.28, -0.38);
    mesh.rotation.set(-0.22, Math.PI / 4, side * 0.08);
    group.add(mesh);
  }

  // ── Epiglotis: hoja curva que se levanta detrás de la escotadura y se
  //    inclina hacia atrás sobre la entrada laríngea.
  const leafRows = 18;
  const leafCols = 16;
  const leafPositions: number[] = [];
  const leafIndices: number[] = [];
  for (let i = 0; i <= leafRows; i += 1) {
    const t = i / leafRows;
    const halfWidth = Math.sin(Math.pow(t, 0.72) * Math.PI) * 0.42 + 0.02;
    for (let j = 0; j <= leafCols; j += 1) {
      const u = (j / leafCols) * 2 - 1;
      const x = u * halfWidth;
      const y = t * 1.05;
      // Curvatura en canal, como la cara lingual de la epiglotis.
      const z = -Math.pow(u, 2) * 0.16 - t * 0.42;
      leafPositions.push(x, y, z);
    }
  }
  for (let i = 0; i < leafRows; i += 1) {
    for (let j = 0; j < leafCols; j += 1) {
      const a = i * (leafCols + 1) + j;
      const b = a + leafCols + 1;
      leafIndices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const leafGeometry = track(new THREE.BufferGeometry());
  leafGeometry.setAttribute("position", new THREE.Float32BufferAttribute(leafPositions, 3));
  leafGeometry.setIndex(leafIndices);
  leafGeometry.computeVertexNormals();

  const epiglottis = new THREE.Mesh(
    leafGeometry,
    track(
      new THREE.MeshStandardMaterial({
        color: PALETTE.clinicLight,
        transparent: true,
        opacity: 0.2,
        roughness: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  epiglottis.add(
    new THREE.LineSegments(
      track(new THREE.EdgesGeometry(leafGeometry, 0.6)),
      track(new THREE.LineBasicMaterial({ color: PALETTE.clinicLight, transparent: true, opacity: 0.3 })),
    ),
  );
  epiglottis.position.set(0, 0.72, 0.16);
  epiglottis.rotation.x = 0.3;
  group.add(epiglottis);

  group.position.y = 0.18;

  return {
    group,
    dispose: () => {
      for (const item of disposables) item.dispose();
    },
  };
}
