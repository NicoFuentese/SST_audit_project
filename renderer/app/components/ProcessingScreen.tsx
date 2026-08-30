"use client";
import CenteredPage from "./ui/CenteredPage";

// Placeholder — se reemplaza por la pantalla real de "Procesando" (3c del
// Planning.md sección 12): subir a AssemblyAI, poll de estado, manejo de
// error/reintento. Por ahora solo confirma que el archivo llegó hasta acá.
export default function ProcessingScreen({ fileName }: { fileName: string }) {
  return (
    <CenteredPage>
      <p className="text-sm text-neutral-500">
        Procesando <span className="font-medium text-neutral-700 dark:text-neutral-300">{fileName}</span>{" "}
        — próximamente.
      </p>
    </CenteredPage>
  );
}
