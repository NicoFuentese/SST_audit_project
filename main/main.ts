import { app, BrowserWindow } from "electron";
import { registerApiKeyHandlers } from "./ipc/apiKey";
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
    width: 1200,
    height: 800,
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
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});