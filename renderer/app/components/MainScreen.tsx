"use client";
import { Mic, FolderOpen, KeyRound, AudioLines } from "lucide-react";
import ActionCard from "./ui/ActionCard";

// Pantalla principal (sección 12, punto 2, del Planning.md). Sin historial:
// siempre parte "limpia". Un solo job activo a la vez — cuando exista estado
// de grabación/procesamiento real, esta pantalla deberá reflejarlo en vez de
// ofrecer las dos acciones (ver Planning.md sección 10).
export default function MainScreen({
  onOpenSettings,
  onSelectUpload,
}: {
  onOpenSettings: () => void;
  onSelectUpload: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col px-8 py-10">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-sm text-accent transition hover:bg-accent/15"
        >
          <KeyRound size={16} />
          Gestionar API Key
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <AudioLines size={34} strokeWidth={1.5} className="text-accent" />
            <h1 className="text-4xl font-semibold tracking-tight">Nueva transcripción</h1>
          </div>
          <p className="mt-3 text-lg italic tracking-tight text-accent/70">
            Graba una reunión o carga un archivo de audio ya grabado.
          </p>
        </div>

        <div className="flex gap-6">
          <ActionCard
            icon={<Mic size={24} />}
            title="Grabar reunión"
            description="Captura micrófono + audio del sistema"
            disabled
            badge="Próximamente"
          />
          <ActionCard
            icon={<FolderOpen size={24} />}
            title="Cargar archivo"
            description="Sube un audio ya grabado"
            onClick={onSelectUpload}
          />
        </div>
      </div>
    </div>
  );
}
