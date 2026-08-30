"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import CenteredPage from "./ui/CenteredPage";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";

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
    <CenteredPage>
      <Card>
        <div className="flex items-center gap-2">
          <KeyRound size={20} className="text-accent" />
          <h1 className="text-lg font-semibold">Configuración inicial</h1>
        </div>
        <p className="text-sm text-neutral-500">
          Ingresa la API key de AssemblyAI del equipo para comenzar. Se valida antes de
          continuar y luego queda guardada de forma cifrada en este equipo.
        </p>

        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          placeholder="API key de AssemblyAI"
          disabled={status === "validating"}
        />

        {status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}

        <Button
          onClick={handleContinue}
          disabled={status === "validating" || !apiKey.trim()}
          className="w-full"
        >
          {status === "validating" ? "Validando..." : "Continuar"}
        </Button>
      </Card>
    </CenteredPage>
  );
}
