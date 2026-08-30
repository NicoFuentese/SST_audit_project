import { ReactNode } from "react";

// Layout estándar para pantallas de un solo panel centrado (la mayoría del
// MVP: onboarding, principal-placeholder, etc.). Las pantallas con contenido
// a pantalla completa (ej. procesando, renombrado de speakers) no la usan.
export default function CenteredPage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-4">{children}</div>;
}
