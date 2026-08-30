"use client";
import { Mic, FolderOpen, Settings, AudioLines } from "lucide-react";
import ActionCard from "./ui/ActionCard";

// Pantalla principal (sección 12, punto 2, del Planning.md). Sin historial:
// siempre parte "limpia". Un solo job activo a la vez — cuando exista estado
// de grabación/procesamiento real, esta pantalla deberá reflejarlo en vez de
// ofrecer las dos acciones (ver Planning.md sección 10).
export default function MainScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="flex min-h-screen flex-col px-12 py-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <AudioLines size={34} strokeWidth={1.5} className="text-accent" />
            <h1 className="text-4xl font-semibold tracking-tight">Nueva transcripción</h1>
          </div>
          <p className="mt-3 text-lg italic tracking-tight text-accent/70">
            Graba una reunión o carga un archivo de audio ya grabado.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Configuración"
          className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="flex flex-1 items-center">
        <div className="flex w-full gap-6">
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
            disabled
            badge="Próximamente"
          />
        </div>
      </div>
    </div>
  );
}
