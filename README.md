# ETVEK — Estudio Técnico Vocal de Eliana Kestler

Sitio público + CMS administrativo propio para ETVEK: alto rendimiento vocal, fonoaudiología y
rehabilitación vocal, con atención 100% online en Argentina, Chile, Colombia, México, EE. UU. y Uruguay.

El contenido editorial **no está hardcodeado**: el texto del brief se carga como *seed* inicial y a partir
de ahí se administra íntegramente desde `/admin`.

---

## Arquitectura

| Capa | Servicio |
|---|---|
| Código y versiones | GitHub (repositorio único) |
| Deploy, previews e infraestructura | Vercel (`main` → producción, cada PR → Preview) |
| Datos estructurados | Prisma Postgres (Vercel Marketplace) vía Prisma ORM |
| Imágenes y assets públicos | Vercel Blob |
| Comprobantes y documentación | Vercel Blob privado, servido sólo con sesión autenticada |

**Stack:** Next.js 15 (App Router, Server Components), React 19, TypeScript, Tailwind CSS 4,
Prisma ORM, Zod, Framer Motion (sólo donde aporta), Lucide Icons.

No se usan Supabase, Firebase, Cloudinary, Netlify, S3 ni almacenamiento local en producción.

---

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- Una base PostgreSQL accesible (en local puede ser un Postgres cualquiera; en producción, Prisma Postgres)

---

## Instalación

```bash
git clone https://github.com/etvek-web/etvek.git
cd etvek
npm install
cp .env.example .env.local
```

Completá `.env.local` (ver la sección **Variables de entorno**) y luego:

```bash
npm run db:migrate     # aplica las migraciones
npm run db:seed        # carga el contenido inicial del brief
npm run admin:create   # crea la usuaria administradora
npm run dev            # http://localhost:3000
```

---

## Variables de entorno

Todas están documentadas en `.env.example`.

| Variable | Obligatoria | Para qué |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión a Prisma Postgres. Si el proveedor ofrece URL *pooled* y *direct*, usá la direct: las migraciones corren en el build. |
| `AUTH_SECRET` | Sí | Firma de las cookies de sesión del panel. Mínimo 32 caracteres. |
| `BLOB_READ_WRITE_TOKEN` | Sí | Lectura/escritura en Vercel Blob. |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | Canonical, sitemap y Open Graph. Si falta o queda vacía se usa `VERCEL_PROJECT_PRODUCTION_URL`, y en local `http://localhost:3000`. Acepta el dominio sin protocolo. |
| `RESEND_API_KEY` / `NOTIFICATIONS_FROM` | No | Aviso por email de nuevas admisiones. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | No | Sólo para crear la administradora vía seed. |

Generar el secreto:

```bash
openssl rand -base64 48
```

`.env` y `.env*.local` están en `.gitignore`. **Nunca** se commitean secretos, tokens ni cadenas de conexión.

---

## Prisma y migraciones

```bash
npm run db:migrate         # crear/aplicar migraciones en desarrollo
npm run db:deploy          # aplicar migraciones en producción
npm run db:studio          # inspeccionar los datos
npm run db:seed            # contenido inicial (idempotente)
```

El esquema (`prisma/schema.prisma`) y las migraciones (`prisma/migrations/`) están versionados en GitHub.
El seed **no es destructivo**: sólo crea lo que falta y nunca sobrescribe un registro existente. Las
tablas con clave natural estable (países por `code`, programas por `slug`) se completan registro por
registro; las que no la tienen (credenciales, trayectoria, métodos de pago, navegación) se siembran
sólo si están vacías, así un registro renombrado o borrado desde `/admin` no reaparece ni se duplica.
Por eso el seed corre en cada deploy sin riesgo.

Verificado: con ediciones y borrados hechos a mano, tres corridas consecutivas del seed dejaron los
conteos y los textos intactos.

---

## Creación de la administradora

No existe registro público: `/signup` no existe y `/admin/*` está protegido en middleware, en cada página
y en cada server action.

Hay dos formas de crear la primera cuenta:

**Desde el navegador (recomendado en Vercel).** Después del primer deploy, entrá a `/admin/setup`.
La pantalla sólo responde mientras la tabla de usuarias está vacía; al crear la cuenta inicia sesión y
queda cerrada de forma permanente. `/admin/login` redirige ahí solo si todavía no hay ninguna cuenta.
Está limitada por rate limit y el alta queda registrada en el log de auditoría.

**Desde una terminal**, si preferís no exponer esa pantalla ni por un minuto:

```bash
npm run admin:create -- --email eliana@etvek.com --name "Eliana Kestler"
```

Pide la contraseña por consola (mínimo 12 caracteres, con mayúscula, minúscula y número) y la guarda
hasheada con `scrypt` + salt aleatorio. Nunca se almacena en texto plano.

---

## Vercel Blob

Dos ámbitos separados:

- **Público** (`media/`, `hero/`, `og/`…): fotografías del sitio, servidas por `next/image`. Los SVG no
  usan el upload directo: se suben por server action para poder **sanearlos** (se eliminan scripts,
  handlers `on*` y referencias externas) antes de almacenarlos.
- **Privado** (`private/`): comprobantes de pago y documentación administrativa. La URL nunca llega al
  navegador; el único acceso es `GET /api/private-files/[id]`, que verifica la sesión, registra la lectura
  en el log de auditoría y hace *proxy* del contenido con `Cache-Control: private, no-store`.

### Pipeline de carga de imágenes

Al elegir una foto en `/admin`, el navegador:

1. valida tipo y tamaño (`MAX_INPUT_SIZE = 25 MB`);
2. lee las dimensiones reales;
3. corrige la orientación EXIF (`imageOrientation: "from-image"`);
4. descarta la metadata EXIF al recodificar;
5. redimensiona según el destino (Hero 2400 px · General 2000 px · Miniatura 800 px · Retrato 600 px);
6. comprime con calidad adaptativa;
7. convierte a WebP cuando conviene (SVG y GIF conservan su formato);
8. muestra preview, peso original, peso optimizado y ahorro;
9. recién entonces sube **sólo la versión optimizada** directo a Blob.

El archivo grande nunca atraviesa una Function: el servidor sólo autoriza el upload, valida el tipo y
genera un pathname seguro. El original no se conserva por defecto (`keepOriginal = false` en el modelo
`Media`, preparado para activarse si en el futuro hace falta).

Medición real del pipeline sobre una foto de cámara de 4032×3024:

```
Original:   4032 × 3024 · 11.2 MB
Optimizada: 2000 × 1500 · 801.6 KB
Ahorro:     93 %
```

Otros controles: deduplicación por SHA-256 del archivo optimizado, saneamiento de SVG, verificación de
*magic bytes* en los comprobantes, validación del pathname propuesto por el navegador (la API de Blob
no permite reescribirlo desde el servidor, así que se rechaza el upload si no tiene la forma esperada) y
bloqueo de borrado de cualquier archivo todavía referenciado.

---

## El panel `/admin`

```
Dashboard                        métricas reales: solicitudes, comprobantes, storage
Sitio                            Inicio · Sobre Eliana · Modalidad Online · Contacto
Contenido                        Programas · Credenciales · Trayectoria · Testimonios ·
                                 Casos de éxito · Países
Multimedia                       Biblioteca de medios
Admisión                         Solicitudes · Pagos y comprobantes · Métodos de pago
Configuración                    Agenda · SEO · Navegación · Redes · Apariencia ·
                                 Configuración · Cuenta
```

Cada página del sitio se edita por secciones (eyebrow, título, subtítulo, cuerpo, imagen, CTA, orden,
visible/oculta) sin romper el diseño: no es un page builder libre, es un sistema de secciones tipadas.

Al publicar un cambio, la web pública se revalida por tags (`revalidateTag`), sin desactivar la caché
de toda la aplicación.

El panel es responsive: cambiar textos, subir una foto, editar un programa o revisar una admisión
funciona desde el celular.

---

## Deploy en Vercel

1. Importar el repositorio de GitHub en Vercel.
2. **Storage → Prisma Postgres** (Marketplace): se vincula al proyecto e inyecta `DATABASE_URL`.
3. **Storage → Blob**: se vincula e inyecta `BLOB_READ_WRITE_TOKEN`.
4. Cargar `AUTH_SECRET` y `NEXT_PUBLIC_SITE_URL` en *Environment Variables*.
5. Deploy. El script `vercel-build` (`scripts/vercel-build.mjs`) resuelve la conexión, aplica las
   migraciones, corre el seed y compila. Acepta `DATABASE_URL`, `PRISMA_DATABASE_URL`,
   `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL` y `POSTGRES_PRISMA_URL`, **con o sin el prefijo del store**
   que agrega la integración de Vercel (por ejemplo `etvek_POSTGRES_URL`). Descarta las cadenas de
   Accelerate (`prisma+postgres://`), porque el proyecto conecta directo a Postgres, y elige la primera
   que sea una URL `postgres://` usable. Si no encuentra ninguna, el build falla explicando qué encontró
   y qué configurar.
6. Abrir `/admin/setup` en el sitio recién publicado y crear la cuenta de Eliana. Esa pantalla sólo
   existe mientras no haya ninguna usuaria: en cuanto se crea la primera, se cierra de forma permanente.

No hace falta una terminal con acceso a la base: las migraciones y el seed corren en el build, y el
alta de la administradora se hace desde el navegador.

Flujo: `GitHub → Vercel → Production`. Cada Pull Request genera un Preview Deployment; los push a `main`
publican en producción.

### Entornos

- **development**: base local, Blob opcional (los uploads requieren `BLOB_READ_WRITE_TOKEN`).
- **preview**: conviene apuntarlo a una base y un store de Blob separados, para que un Preview no
  modifique contenido ni archivos de producción. Si comparten la base de producción, cualquier cambio
  hecho desde el `/admin` de un Preview impacta en la web real.
- **production**: base y Blob de producción.

### Dominio

Vercel → *Settings → Domains* → agregar `etvek.com` y `www.etvek.com`. El certificado SSL se emite
automáticamente. Después del cambio de dominio, actualizar `NEXT_PUBLIC_SITE_URL`.

---

## Backup

- **Base de datos**: Prisma Postgres mantiene backups gestionados desde el dashboard de Vercel.
  Para una copia manual: `pg_dump "$DATABASE_URL" > backup-$(date +%F).sql`.
- **Blob**: los archivos son inmutables y tienen URL estable; la metadata (nombre, alt, dimensiones,
  peso, hash) vive en Postgres, así que el backup de la base conserva el inventario completo.
- **Contenido editorial**: al estar en Postgres, entra en el mismo backup.

---

## Privacidad y datos sensibles

El formulario de admisión puede incluir información sobre el estado de la voz. Por eso:

- el campo *objetivo* nunca se envía a analítica ni se registra como evento;
- las conversiones internas guardan sólo el nombre del evento y la ruta;
- los comprobantes son privados y su lectura queda auditada;
- las notas internas de una admisión son visibles sólo en el panel y jamás se envían al alumno;
- los datos personales no viajan en URLs.

---

## Textos legales

`/privacidad`, `/terminos` y `/cookies` tienen un borrador técnico marcado con
«Texto base pendiente de revisión profesional». **Deben ser revisados por un asesor legal antes de la
publicación definitiva.** Se editan desde `/admin → Sitio`.

---

## Contenido que debe cargar el cliente

El sitio funciona completo sin estos datos (las secciones vacías simplemente no se muestran), y todos se
cargan desde `/admin` sin tocar código:

- fotografías reales de Eliana (Hero, Sobre Eliana, programas);
- número de WhatsApp;
- URL de la agenda (Calendly / SavvyCal);
- datos bancarios: titular, banco, CBU/CVU, alias, y datos de MoneyGram;
- precios en ARS y USD (y si se muestran o no);
- testimonios y casos de éxito reales, con consentimiento de publicación;
- redes sociales;
- imagen Open Graph.

No hay datos inventados en el repositorio: ni testimonios, ni artistas, ni estadísticas, ni credenciales
fuera de las que constan en el brief.

---

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma |
| `npm run admin:create` | Crear o actualizar la administradora desde una terminal |
| `npm run vercel-build` | Lo que corre Vercel: conexión + migraciones + seed + build |

---

## Troubleshooting

**`AUTH_SECRET no está definido o es demasiado corto`**
Falta la variable o tiene menos de 32 caracteres. Generala con `openssl rand -base64 48`.

**`BLOB_READ_WRITE_TOKEN no está configurado`**
El store de Blob no está vinculado al proyecto en Vercel, o falta la variable en local.

**El panel redirige siempre a `/admin/login`**
La cookie de sesión no se está guardando. En producción requiere HTTPS; si cambiaste `AUTH_SECRET`,
todas las sesiones existentes quedan invalidadas: volvé a iniciar sesión.

**Activé el modo mantenimiento y el sitio sigue visible**
El modo mantenimiento se aplica al guardar desde `/admin → Configuración`, que es lo que dispara la
revalidación. Cambiarlo directamente en la base no invalida la caché de las páginas.

**Un cambio del panel no aparece en la web**
La revalidación por tags es inmediata al guardar. Si el navegador muestra la versión vieja, forzá una
recarga sin caché. Verificá también que la sección esté *visible* y en estado *Publicada*.

**No puedo eliminar una imagen**
Está referenciada por alguna sección, programa, testimonio o metadato SEO. El detalle del archivo, en
*Biblioteca de medios*, lista exactamente dónde se usa.

**`P2002` al guardar**
Hay un valor único repetido: slug de programa, código ISO de país o email de usuaria.

**Error de migraciones en el deploy**
Verificá que `DATABASE_URL` apunte a una conexión con permisos de DDL y sin pooling. Si el proveedor te
da una URL *pooled* y otra *direct*, usá la direct: `prisma migrate deploy` corre en el build.

**`P1001: Can't reach database server`**
La red desde donde corrés el comando no llega al puerto 5432 del host, o la cadena apunta a un host
equivocado. Las migraciones en producción no dependen de esto: corren dentro del build de Vercel.

**`P1012: ... resolved to an empty string`**
La variable existe en Vercel pero está vacía, y Prisma trata la cadena vacía como error, no como
ausente. Revisá *Settings → Environment Variables*: una variable vacía cuenta como mal configurada.
Ojo con los entornos: Production, Preview y Development se cargan por separado, así que una variable
puesta sólo en Production no está disponible en un Preview.

**`No hay conexión a la base de datos`**
Lo imprime `scripts/vercel-build.mjs` cuando no encuentra ninguna variable con una URL `postgres://`
usable. Casos:

- El store no quedó vinculado al proyecto: *Storage → Prisma Postgres → Connect Project*. Después del
  vínculo hay que **redeployar**: las variables nuevas no entran en un deploy ya iniciado.
- Todas las cadenas encontradas son de Accelerate (`prisma+postgres://`). El mensaje las lista por
  nombre. Copiá del panel de Prisma Postgres la connection string que empieza con `postgres://` y
  guardala como `DATABASE_URL`.

El prefijo del store no es un problema: `etvek_POSTGRES_URL` y similares se detectan solos, tanto en el
build como en runtime — `src/lib/database-url.ts` es la única fuente de verdad y la usan el script de
build, el cliente de Prisma y el seed.

**`Environment variable not found: DATABASE_URL` en runtime (no en el build)**
Ocurría cuando la conexión sólo existía como variable prefijada: el build la reescribía, pero las
funciones en runtime no veían esa reescritura. El cliente de Prisma ahora resuelve la conexión por su
cuenta, así que no depende del nombre de la variable.

**`sitemap.xml` o los canonical apuntan a `localhost`**
`robots.txt` y `sitemap.xml` se prerenderizan durante el build, así que toman la base de ese momento.
Cargá `NEXT_PUBLIC_SITE_URL` con el dominio definitivo y redeployá.

**El seed avisa `ADMIN_PASSWORD insegura`**
El build sigue adelante a propósito: el seed nunca voltea un deploy. Corregí la variable o creá la
cuenta desde `/admin/setup`. Después del primer ingreso, **borrá `ADMIN_PASSWORD`** de las variables de
entorno: no hace falta que una contraseña quede guardada ahí.

**Vercel deploya la rama equivocada**
*Settings → Git → Production Branch* debe decir `main`.
