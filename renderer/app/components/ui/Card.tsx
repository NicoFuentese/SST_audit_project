import { ReactNode } from "react";

// Contenedor estándar para paneles centrados (formularios, confirmaciones).
export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 p-8 dark:border-neutral-700 ${className}`}
    >
      {children}
    </div>
  );
}
