"use client";
import { useEffect, useRef } from "react";

const BAR_COUNT = 28;
const GAP = 3;

// Dibuja directo en Canvas vía requestAnimationFrame, sin pasar por estado de
// React en cada frame (evita re-renders innecesarios a 60fps). El color se
// lee del token --accent en el momento de montar, así respeta el tema activo
// (claro/oscuro) sin duplicar el valor hardcodeado en JS.
export default function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect();
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.scale(dpr, dpr);

    const accentColor =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0284C7";

    const data = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    const smoothed = new Array(BAR_COUNT).fill(0.04);
    const step = Math.max(1, Math.floor(data.length / BAR_COUNT));
    const barWidth = (cssWidth - GAP * (BAR_COUNT - 1)) / BAR_COUNT;

    let frame: number;
    function draw() {
      analyser!.getByteFrequencyData(data);
      ctx!.clearRect(0, 0, cssWidth, cssHeight);
      ctx!.fillStyle = accentColor;

      for (let i = 0; i < BAR_COUNT; i++) {
        const raw = data[i * step] / 255;
        // suavizado exponencial: sube rápido, baja con un poco de inercia,
        // para que se lea como "onda" y no como parpadeo brusco.
        smoothed[i] = smoothed[i] * 0.65 + raw * 0.35;
        const barHeight = Math.max(smoothed[i] * cssHeight, 3);
        const x = i * (barWidth + GAP);
        const y = (cssHeight - barHeight) / 2;
        const radius = Math.min(barWidth / 2, 3);
        ctx!.beginPath();
        ctx!.roundRect(x, y, barWidth, barHeight, radius);
        ctx!.fill();
      }

      frame = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(frame);
  }, [analyser]);

  return <canvas ref={canvasRef} className="h-12 w-full" />;
}
