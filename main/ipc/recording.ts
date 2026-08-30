import { ipcMain, app } from "electron";
import fs from "fs";
import path from "path";

// Vive en userData (igual que apikey.enc) — fuera del repo, fuera del paquete
// de instalación. Es el "audio temporal local" de la sección 3 del Planning.md:
// se conserva hasta confirmar exportación + limpieza remota exitosas.
function recordingsDir(): string {
  const dir = path.join(app.getPath("userData"), "recordings");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function registerRecordingHandlers() {
  ipcMain.handle("recording:save", (_event, buffer: ArrayBuffer, extension: string) => {
    const fileName = `reunion-${Date.now()}.${extension}`;
    const filePath = path.join(recordingsDir(), fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  });
}
