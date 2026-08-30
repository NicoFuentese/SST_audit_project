"use client";
import { ReactNode } from "react";

// Tarjeta de acción grande, usada en la pantalla principal (Grabar / Cargar
// archivo) y candidata a reutilizarse en cualquier otra pantalla que necesite
// presentar 2-3 acciones principales como opciones equivalentes.
export default function ActionCard({
  icon,
  title,
  description,
  onClick,
  disabled,
  badge,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-64 w-64 flex-col items-start justify-between rounded-2xl border border-neutral-200 p-7 text-left transition hover:border-accent hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-200 disabled:hover:bg-transparent dark:border-neutral-700 dark:disabled:hover:border-neutral-700"
    >
      <div className="flex w-full items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
          {icon}
        </span>
        {badge && (
          <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 dark:border-neutral-600">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
      </div>
    </button>
  );
}
