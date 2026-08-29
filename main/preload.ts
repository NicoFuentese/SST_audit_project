import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getApiKey: () => ipcRenderer.invoke("api-key:get"),
  setApiKey: (key: string) => ipcRenderer.invoke("api-key:set", key),
  validateApiKey: (key: string) => ipcRenderer.invoke("api-key:validate", key),
});
