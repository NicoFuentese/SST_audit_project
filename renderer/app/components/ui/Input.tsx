"use client";
import { InputHTMLAttributes } from "react";

// Input estándar de toda la app — mismo borde, radio y estado de foco/disabled
// en cualquier pantalla que lo use.
export default function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 dark:border-neutral-600 ${className}`}
    />
  );
}
