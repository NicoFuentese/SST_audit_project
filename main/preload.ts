import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
  // acá se van a exponer las funciones puntuales (getApiKey, setApiKey, etc.)
});