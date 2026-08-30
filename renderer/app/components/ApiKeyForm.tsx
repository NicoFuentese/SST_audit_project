"use client";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";

type Status = "idle" | "validating" | "error";

// Formulario de API key compartido entre Configuración inicial (onboarding)
// y Configuración/editar key — misma validación, mismo guardado, distinto
// texto y acción posterior según quién lo use.
export default function ApiKeyForm({
  title,
  description,
  initialValue = "",
  submitLabel,
  onSaved,
  secondaryAction,
}: {
  title: string;
  description: string;
  initialValue?: string;
  submitLabel: string;
  onSaved: () => void;
  secondaryAction?: { label: string; onClick: () => void };
}) {
  const [apiKey, setApiKey] = useState(initialValue);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
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
    onSaved();
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <KeyRound size={20} className="text-accent" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <p className="text-sm text-neutral-500">{description}</p>

      <Input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="API key de AssemblyAI"
        disabled={status === "validating"}
      />

      {status === "error" && <p className="text-sm text-red-500">{errorMessage}</p>}

      <Button
        onClick={handleSubmit}
        disabled={status === "validating" || !apiKey.trim()}
        className="w-full"
      >
        {status === "validating" ? "Validando..." : submitLabel}
      </Button>

      {secondaryAction && (
        <Button variant="secondary" onClick={secondaryAction.onClick} className="w-full">
          {secondaryAction.label}
        </Button>
      )}
    </Card>
  );
}
