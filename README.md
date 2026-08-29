# Sistema de Transcripción Inteligente de Reuniones

Aplicación de escritorio interna (Windows y macOS) para grabar reuniones — micrófono + audio del sistema — o cargar archivos de audio ya grabados, transcribirlos automáticamente con diarización (identificación de hablantes) y exportarlos en TXT/Markdown/JSON.

No genera resúmenes ni usa agentes de IA: el objetivo es una transcripción completa y precisa que luego se pueda usar en cualquier herramienta externa (ChatGPT, Claude, etc.) para análisis.

El diseño completo — problema, evaluación de proveedores, arquitectura, stack, decisiones y flujo de pantallas — está documentado en **[`Planning.md`](./Planning.md)**. Este README cubre solo lo operativo: cómo correr y desarrollar el proyecto.

> **Estado:** en desarrollo activo (MVP). El esqueleto técnico (Electron + Next.js + IPC + almacenamiento cifrado de la API key) ya está funcionando; las pantallas y el pipeline de transcripción se están construyendo.

---

## Stack técnico

TypeScript de punta a punta — sin backend separado. La lógica sensible (API key, llamadas a AssemblyAI) corre en el proceso *main* de Electron; el renderer (Next.js) nunca accede a ella directamente, solo vía IPC.

| Pieza | Versión |
|---|---|
| Node.js | v22.22.3 (LTS) |
| Electron | 44.0.0 (Chromium 152 embebido — cubre el mínimo de Chromium 141+ que necesita la captura de audio de sistema en macOS, ver `Planning.md` sección 11) |
| Next.js (renderer) | 16.3.3 |
| React | 19.2.8 |
| TypeScript (proceso main) | 7.0.2 |
| TypeScript (renderer) | ^5 *(nota: distinta de la del proceso main porque cada carpeta es un proyecto npm independiente — ver "Estructura" abajo. No es un problema funcional, pero es una inconsistencia a unificar más adelante si molesta)* |
| Tailwind CSS (renderer) | ^4 |
| electron-builder | ^26.15.3 *(instalado, aún sin configurar — ver TODO)* |
| SDK de AssemblyAI (Node) | ^4.37.0 |
| concurrently / wait-on | orquestan `npm run dev` (Next + compilación del main + Electron en paralelo) |

Proveedor de transcripción + diarización: **AssemblyAI** (no OpenAI — ver justificación técnica en `Planning.md` sección 6).

---

## Estructura del proyecto

```
├── main/                    # Proceso main de Electron (TypeScript, compila a dist/main/)
│   ├── main.ts               # Entry point: crea la ventana, carga dev/prod
│   ├── preload.ts            # contextBridge: única puerta de entrada del renderer al main
│   ├── ipc/                  # Handlers de IPC organizados por dominio (ej. apiKey.ts)
│   └── tsconfig.json
├── renderer/                 # Next.js (proyecto npm independiente, su propio package.json)
│   ├── app/                   # App Router (pantallas)
│   └── types/electron.d.ts    # Tipado de `window.api` expuesto por el preload
├── dist/main/                # Salida compilada del proceso main (ignorado por git)
└── Planning.md                # Documento de diseño completo
```

**Importante**: `renderer/` es un proyecto npm **separado**, con su propio `package.json`, `node_modules` y `package-lock.json`. Hay que instalar dependencias en los dos lados (ver abajo) — es la causa más común de errores tipo `next: command not found` si se olvida.

---

## Requisitos previos

- Node.js v20+ (probado con v22.22.3).
- Windows o macOS (macOS 14.2+ si se va a probar captura de audio de sistema en vivo — ver `Planning.md` sección 11).
- Una API key de AssemblyAI (se ingresa **dentro de la app**, en el primer inicio — no se usa `.env`, ver sección siguiente).

---

## Instalación

Dos pasos, uno por cada proyecto npm:

```bash
# 1. Dependencias del proceso main / raíz
npm install

# 2. Dependencias del renderer (Next.js)
npm install --prefix renderer
```

---

## Desarrollo

```bash
npm run dev
```

Esto levanta, en paralelo:
1. `watch:main` — compila el proceso main en modo watch (recompila al guardar).
2. `dev:renderer` — corre `next dev` dentro de `renderer/`.
3. `dev:electron` — espera a que el puerto 3000 esté listo (`wait-on`) y abre la ventana de Electron.

Scripts individuales disponibles (todos en el `package.json` raíz):

| Script | Qué hace |
|---|---|
| `npm run build:main` | Compila `main/*.ts` a `dist/main/` una sola vez |
| `npm run watch:main` | Igual, pero recompilando en cada cambio |
| `npm run dev:renderer` | Solo el servidor de desarrollo de Next.js |
| `npm run dev:electron` | Solo Electron (asume que ya hay algo corriendo en :3000 y `dist/main/` ya compilado) |
| `npm run dev` | Los tres juntos — el comando que normalmente vas a usar |

Para tocar solo el renderer sin Electron (ej. iterar rápido en una pantalla): `npm run dev --prefix renderer` y abre `http://localhost:3000` directo en un navegador Chromium — funciona para lo visual, pero `window.api` no va a existir fuera de Electron (cualquier pantalla que dependa de IPC va a fallar ahí, es normal).

---

## Manejo de la API key

No hay `.env` para la key de AssemblyAI. Se ingresa una vez desde la propia app (pantalla de configuración inicial), se cifra con `safeStorage` de Electron (Keychain en macOS, DPAPI en Windows) y se guarda en la carpeta de datos de usuario de la app — nunca en el repo ni en el paquete distribuido.

---

## Pendiente / TODO

- **`electron-builder`**: instalado pero sin configurar. Falta el bloque `build` en `package.json` (appId, targets Windows/macOS, íconos) para poder generar un instalador — no bloquea el desarrollo actual. Ojo: su carpeta de salida por defecto es `dist/`, la misma que usa la compilación de TypeScript del main — hay que redirigirla (ej. a `release/`) para no pisarla.
- **Tests**: el script `npm test` es un placeholder, no hay suite de pruebas todavía.
- **Lint del proceso main**: `renderer/` tiene ESLint configurado (vía `create-next-app`); `main/` no tiene lint propio todavía.
- Pantallas del MVP y pipeline de transcripción: ver el flujo completo y qué falta en `Planning.md` sección 12.
