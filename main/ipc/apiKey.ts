import { ipcMain, safeStorage, app } from "electron";
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
}