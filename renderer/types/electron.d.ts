export {};

declare global {
  interface Window {
    api: {
      getApiKey: () => Promise<string | null>;
      setApiKey: (key: string) => Promise<boolean>;
    };
  }
}