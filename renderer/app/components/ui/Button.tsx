"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
};

// Botón estándar de toda la app. variant="primary" es LA acción principal de
// cada pantalla (una sola por pantalla, normalmente) — variant="secondary"
// para acciones alternativas/de menor jerarquía (ej. "Omitir", "Cancelar").
export default function Button({
  variant = "primary",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-accent text-white hover:bg-accent-hover",
    secondary:
      "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}
