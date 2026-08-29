"use client";
import { useState } from "react";

type Status = "idle" | "validating" | "error";

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleContinue() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;

    setStatus("validating");
    setErrorMessage("");

    const result = await window.api.validateApiKey(trimmed);
    if (!result.valid) {
      setStatus("error");
      setErrorMessage(result.error ?? "La API key no es válida.");
      return;
    }

    await window.api.setApiKey(trimmed);
    onComplete();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 p-8 dark:border-neutral-700">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Configuración inicial</h1>
          <p className="text-sm text-neutral-500">
            Ingresa la API key de AssemblyAI del equipo para comenzar. Se valida antes de
            continuar y luego queda guardada de forma cifrada en este equipo.
          </p>
        </div>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          placeholder="API key de AssemblyAI"
          disabled={status === "validating"}
          className="w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 disabled:opacity-50 dark:border-neutral-600"
        />

        {status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}

        <button
          onClick={handleContinue}
          disabled={status === "validating" || !apiKey.trim()}
          className="w-full rounded bg-neutral-900 py-2 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {status === "validating" ? "Validando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}
