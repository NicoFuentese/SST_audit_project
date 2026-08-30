"use client";
import CenteredPage from "./ui/CenteredPage";
import ApiKeyForm from "./ApiKeyForm";

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <CenteredPage>
      <ApiKeyForm
        title="Configuración inicial"
        description="Ingresa la API key de AssemblyAI del equipo para comenzar. Se valida antes de continuar y luego queda guardada de forma cifrada en este equipo."
        submitLabel="Continuar"
        onSaved={onComplete}
      />
    </CenteredPage>
  );
}
