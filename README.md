# Sistema de Transcripción Inteligente de Reuniones

Aplicación de escritorio interna (Windows y macOS) para grabar reuniones — micrófono + audio del sistema — o cargar archivos de audio ya grabados, transcribirlos automáticamente con diarización (identificación de hablantes) y exportarlos en TXT/Markdown/JSON.

No genera resúmenes ni usa agentes de IA: el objetivo es una transcripción completa y precisa que luego se pueda usar en cualquier herramienta externa (ChatGPT, Claude, etc.) para análisis.

El diseño completo — problema, evaluación de proveedores, arquitectura, stack, decisiones y flujo de pantallas — está documentado en **[`Planning.md`](./Planning.md)**. Este README cubre solo lo operativo: cómo correr y desarrollar el proyecto.

> **Estado:** en desarrollo activo (MVP). Esqueleto técnico funcionando (Electron + Next.js + IPC + `safeStorage`), sistema de diseño definido, captura de audio real (mic + sistema) funcionando, y 5 de las 8 pantallas del flujo ya construidas — ver tabla de estado más abajo.

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
| lucide-react | íconos, usados en toda la UI |
| concurrently / wait-on | orquestan `npm run dev` (Next + compilación del main + Electron en paralelo) |

Proveedor de transcripción + diarización: **AssemblyAI** (no OpenAI — ver justificación técnica en `Planning.md` sección 6).

---

## Estructura del proyecto

```
├── main/                    # Proceso main de Electron (TypeScript, compila a dist/main/)
│   ├── main.ts               # Entry point: crea la ventana, carga dev/prod, setDisplayMediaRequestHandler
│   ├── preload.ts            # contextBridge: única puerta de entrada del renderer al main
│   ├── ipc/                  # Handlers de IPC por dominio (apiKey.ts, recording.ts)
│   └── tsconfig.json
├── renderer/                 # Next.js (proyecto npm independiente, su propio package.json)
│   ├── app/
│   │   ├── page.tsx            # Orquesta qué pantalla mostrar (state machine simple)
│   │   ├── components/         # Pantallas: Onboarding, Main, Settings, Upload, Recording, Processing, ApiKeyForm
│   │   └── components/ui/      # Sistema de diseño: Button, Input, Card, ActionCard, CenteredPage, Waveform
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

**Ojo con esto**: cambios en `main/` o en `preload.ts` **no se recargan solos**. `watch:main` recompila el archivo en disco, pero la ventana de Electron ya abierta sigue con el preload/proceso main que cargó al crearse — a diferencia del renderer, que sí tiene hot reload. Si algo que tocaste en `main/`/`preload.ts` no parece estar funcionando, corta `npm run dev` por completo y vuelve a correrlo antes de asumir que hay un bug.

---

## Manejo de la API key

No hay `.env` para la key de AssemblyAI. Se ingresa una vez desde la propia app (pantalla de configuración inicial), se cifra con `safeStorage` de Electron (Keychain en macOS, DPAPI en Windows) y se guarda en la carpeta de datos de usuario de la app — nunca en el repo ni en el paquete distribuido.

---

## Captura de audio y grabaciones

La grabación combina dos fuentes: `getUserMedia` (micrófono) y `getDisplayMedia` (audio del sistema, capturado en modo `loopback`). Un detalle propio de Electron a tener presente: `getDisplayMedia` **no funciona solo** como en un navegador — hay que registrar `session.defaultSession.setDisplayMediaRequestHandler` en `main.ts`, que es quien decide qué se comparte (en Windows, sin diálogo visible; en macOS 15+, delega al picker nativo del sistema vía `useSystemPicker`).

Las dos fuentes se mezclan con Web Audio API (`MediaStreamAudioDestinationNode`) y se graban con `MediaRecorder` en `webm/opus`. El archivo resultante se guarda en:

```
<userData>/recordings/reunion-<timestamp>.webm
```

En Windows, eso es `%APPDATA%\transcripcion-reuniones\recordings\`. Es una carpeta **temporal** — todavía no existe la limpieza automática (ver TODO), así que los archivos se van a acumular ahí hasta que se conecte el pipeline real con AssemblyAI y su borrado (`Planning.md` sección 3).

---

## Modo simulación (solo desarrollo)

Para probar el flujo/diseño de la app sin depender de una API key real de AssemblyAI, la pantalla de Configuración inicial acepta el string **`admin`** como key — pasa la validación sin llamar a la API real y deja avanzar a la pantalla principal.

Gateado por `!app.isPackaged` (en `main/ipc/apiKey.ts`): esta rama **no existe** en un build empaquetado, así que no hay forma de que llegue a producción ni a un instalador distribuido. Solo funciona corriendo `npm run dev`.

Cubre únicamente la validación de la key. Cuando se construya el pipeline real de transcripción (subida, poll, resultado), esa parte va a necesitar una key real de AssemblyAI para probarse de punta a punta — o, si se quiere seguir probando sin gastar créditos, extender esta misma idea con datos de transcripción simulados.

---

## Estado de las pantallas

Flujo completo definido en `Planning.md` sección 12. Estado actual:

| # | Pantalla | Estado |
|---|---|---|
| 1 | Configuración inicial (API key + validación) | ✅ Construida |
| 2 | Pantalla principal (Grabar / Cargar archivo) | ✅ Construida |
| 3a | Grabando | ✅ Construida — captura mic + sistema, cronómetro, waveform en vivo. Falta minimizar a bandeja del sistema (ver TODO) |
| 3b | Cargar archivo | ✅ Construida — drag & drop + selector |
| 3c | Procesando | 🔲 Pendiente — siguiente en la fila. Hoy ambos flujos (3a y 3b) caen en un placeholder |
| 4 | Renombrado de speakers | 🔲 Pendiente |
| 5 | Exportación | 🔲 Pendiente |
| 6 | Configuración / editar API key | ✅ Construida |

Sistema de diseño (paleta, tipografía, componentes base) documentado en `Planning.md` sección 12, con referencia visual de las 4 direcciones evaluadas.

---

## Pendiente / TODO

- **`electron-builder`**: instalado pero sin configurar. Falta el bloque `build` en `package.json` (appId, targets Windows/macOS, íconos) para poder generar un instalador — no bloquea el desarrollo actual. Ojo: su carpeta de salida por defecto es `dist/`, la misma que usa la compilación de TypeScript del main — hay que redirigirla (ej. a `release/`) para no pisarla.
- **Tests**: el script `npm test` es un placeholder, no hay suite de pruebas todavía.
- **Lint del proceso main**: `renderer/` tiene ESLint configurado (vía `create-next-app`); `main/` no tiene lint propio todavía.
- **Modo simulación**: hoy solo cubre la validación de la API key (ver arriba). Evaluar extenderlo al pipeline de transcripción (datos simulados) cuando se construya, para poder probar el flujo completo sin gastar créditos de AssemblyAI.
- **Bandeja del sistema (Tray)**: la pantalla de Grabar reunión (3a) todavía no se puede minimizar a la bandeja del sistema mientras graba, como pide `Planning.md` sección 12 — quedó deliberadamente fuera para priorizar validar que la captura de audio funcionara bien primero.
- **Limpieza de grabaciones**: los archivos en `<userData>/recordings/` se acumulan sin borrarse — falta implementar el borrado automático (local + remoto en AssemblyAI) una vez que el pipeline de transcripción esté conectado (`Planning.md` sección 3).
- **Almacenamiento permanente de audio (carpeta elegida por el usuario)**: evaluado y descartado por ahora — detalle de por qué y qué implicaría en `Planning.md` sección 10.
