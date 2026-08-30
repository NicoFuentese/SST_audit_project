import { ipcMain, safeStorage, app } from "electron";
import { AssemblyAI } from "assemblyai";
import fs from "fs";
import path from "path";

const keyFilePath = () => path.join(app.getPath("userData"), "apikey.enc");

export function registerApiKeyHandlers() {
  ipcMain.handle("api-key:get", () => {
    const filePath = keyFilePath();
    if (!fs.existsSync(filePath)) return null;
    const encrypted = fs.readFileSync(filePath);
    return safeStorage.decryptString(encrypted);
  });

  ipcMain.handle("api-key:set", (_event, apiKey: string) => {
    const encrypted = safeStorage.encryptString(apiKey);
    fs.writeFileSync(keyFilePath(), encrypted);
    return true;
  });

  // Llamada liviana y sin costo (solo lista, no procesa audio) para confirmar
  // que la key es válida antes de dejar continuar al usuario.
  ipcMain.handle("api-key:validate", async (_event, apiKey: string) => {
    // Atajo SOLO de desarrollo: simula una key válida sin llamar a AssemblyAI,
    // para poder probar el flujo/diseño de la app sin una key real todavía.
    // Gateado por app.isPackaged: en un build empaquetado esta rama no existe
    // (isPackaged siempre es true ahí), así que no puede llegar a producción.
    if (!app.isPackaged && apiKey === "admin") {
      return { valid: true };
    }

    try {
      const client = new AssemblyAI({ apiKey });
      await client.transcripts.list({ limit: 1 });
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "La API key no es válida.",
      };
    }
  });
}