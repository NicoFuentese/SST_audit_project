import { app, BrowserWindow, session, desktopCapturer } from "electron";
import { registerApiKeyHandlers } from "./ipc/apiKey";
import { registerRecordingHandlers } from "./ipc/recording";
import path from "path";

// Sin esto, al correr "electron dist/main/main.js" sin empaquetar, Electron no
// puede resolver un nombre propio y cae al genérico "Electron" — lo que hace
// que userData (donde vive la API key cifrada) se comparta entre cualquier
// app de Electron en desarrollo en esta máquina. Debe fijarse antes de
// cualquier app.getPath("userData").
app.setName("transcripcion-reuniones");

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile(path.join(__dirname, "../../renderer/out/index.html"));
  }
}

app.whenReady().then(() => {
  registerApiKeyHandlers();
  registerRecordingHandlers();

  // getDisplayMedia no funciona "solo" en Electron como en un navegador —
  // hay que decidir nosotros qué se comparte. audio: "loopback" es lo que
  // habilita capturar el audio del sistema (WASAPI en Windows, equivalente
  // en macOS). useSystemPicker delega al picker nativo del SO cuando está
  // disponible (hoy: macOS 15+); en Windows no hay picker visible — se elige
  // la pantalla automáticamente, sin diálogo.
  session.defaultSession.setDisplayMediaRequestHandler(
    (_request, callback) => {
      desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
        callback({ video: sources[0], audio: "loopback" });
      });
    },
    { useSystemPicker: true }
  );

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});