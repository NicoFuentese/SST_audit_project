"use client";
import { useRef, useState } from "react";
import { ArrowLeft, FileAudio, UploadCloud, X } from "lucide-react";
import Button from "./ui/Button";

// Extensiones objetivo del MVP (Planning.md sección 3). Solo guía el filtro
// del selector nativo — AssemblyAI acepta bastantes más formatos, así que no
// se bloquea nada más estricto que esto en el cliente.
const ACCEPTED = ".mp3,.m4a,.wav,.aac,.webm,.mp4,.mpeg,.mpga,audio/*";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

type SelectedFile = { name: string; size: number; path: string };

export default function UploadScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (file: SelectedFile) => void;
}) {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(raw: File) {
    const path = window.api.getFilePath(raw);
    setFile({ name: raw.name, size: raw.size, path });
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  return (
    <div className="flex min-h-screen flex-col px-8 py-10">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Cargar archivo</h1>
          <p className="mt-3 text-lg italic tracking-tight text-accent/70">
            Sube un audio ya grabado — un archivo a la vez.
          </p>
        </div>

        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex h-64 w-[28rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition ${
              isDragOver
                ? "border-accent bg-accent/5"
                : "border-neutral-300 hover:border-accent hover:bg-accent/5 dark:border-neutral-600"
            }`}
          >
            <UploadCloud size={32} className="text-accent" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium">Arrastra tu archivo aquí</p>
              <p className="mt-1 text-xs text-neutral-500">o haz click para buscarlo</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFile(selected);
              }}
            />
          </div>
        ) : (
          <div className="flex w-[28rem] flex-col gap-6 rounded-2xl border border-neutral-200 p-7 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <FileAudio size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Quitar archivo"
                className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X size={16} />
              </button>
            </div>

            <Button onClick={() => onContinue(file)} className="w-full">
              Continuar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
