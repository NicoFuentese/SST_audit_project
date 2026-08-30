import { contextBridge, ipcRenderer, webUtils } from "electron";

contextBridge.exposeInMainWorld("api", {
  getApiKey: () => ipcRenderer.invoke("api-key:get"),
  setApiKey: (key: string) => ipcRenderer.invoke("api-key:set", key),
  validateApiKey: (key: string) => ipcRenderer.invoke("api-key:validate", key),
  // File.path fue deprecado por Electron desde la v32 por temas de seguridad;
  // webUtils.getPathForFile es el reemplazo oficial, y solo se puede llamar
  // desde el preload (no está disponible en el renderer aislado).
  getFilePath: (file: File) => webUtils.getPathForFile(file),
  saveRecording: (buffer: ArrayBuffer, extension: string) =>
    ipcRenderer.invoke("recording:save", buffer, extension),
});
