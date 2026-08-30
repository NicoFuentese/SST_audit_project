export {};

declare global {
  interface Window {
    api: {
      getApiKey: () => Promise<string | null>;
      setApiKey: (key: string) => Promise<boolean>;
      validateApiKey: (key: string) => Promise<{ valid: boolean; error?: string }>;
      getFilePath: (file: File) => string;
      saveRecording: (buffer: ArrayBuffer, extension: string) => Promise<string>;
    };
  }
}
