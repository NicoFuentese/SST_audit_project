"use client";
import { useEffect, useState } from "react";
import CenteredPage from "./ui/CenteredPage";
import ApiKeyForm from "./ApiKeyForm";

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  useEffect(() => {
    window.api.getApiKey().then((key) => setCurrentKey(key ?? ""));
  }, []);

  // Carga el valor actual antes de renderizar el form, para no mostrar un
  // campo vacío por un instante y luego "saltar" al valor real.
  if (currentKey === null) return null;

  return (
    <CenteredPage>
      <ApiKeyForm
        title="Configuración"
        description="Edita o rota la API key compartida del equipo. Se vuelve a validar antes de guardar."
        initialValue={currentKey}
        submitLabel="Guardar"
        onSaved={onBack}
        secondaryAction={{ label: "Volver", onClick: onBack }}
      />
    </CenteredPage>
  );
}
