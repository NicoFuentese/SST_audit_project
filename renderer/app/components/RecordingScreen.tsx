"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Square } from "lucide-react";
import Button from "./ui/Button";
import Waveform from "./ui/Waveform";

type Stage = "intro" | "requesting" | "recording" | "saving" | "error";

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function RecordingScreen({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: (file: { name: string; path: string }) => void;
}) {
  const [stage, setStage] = useState<Stage>("intro");
  const [errorMessage, setErrorMessage] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [systemAnalyser, setSystemAnalyser] = useState<AnalyserNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRecordingRef = useRef<() => void>(() => {});

  function cleanupTracksAndTimers() {
    if (timerRef.current) clearInterval(timerRef.current);
    streamsRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    audioContextRef.current?.close().catch(() => {});
  }

  useEffect(() => {
    // Si el usuario navega fuera a mitad de grabación (ej. cierra la app),
    // no dejar streams ni el AudioContext abiertos.
    return () => cleanupTracksAndTimers();
  }, []);

  async function startRecording() {
    setStage("requesting");
    setErrorMessage("");

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // No necesitamos el video — se descarta apenas se obtiene, para no
      // gastar recursos grabándolo.
      displayStream.getVideoTracks().forEach((t) => t.stop());

      const systemAudioTracks = displayStream.getAudioTracks();
      if (systemAudioTracks.length === 0) {
        micStream.getTracks().forEach((t) => t.stop());
        throw new Error(
          "No se detectó audio del sistema al compartir. Revisa los permisos de audio de tu sistema operativo e intenta de nuevo."
        );
      }
      // Si el usuario corta el compartir desde el control nativo del SO a
      // mitad de la grabación, cerramos prolijamente en vez de quedar con un
      // stream muerto grabando silencio.
      systemAudioTracks[0].addEventListener("ended", () => stopRecordingRef.current());

      streamsRef.current = [micStream, displayStream];

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const destination = audioContext.createMediaStreamDestination();

      const micSource = audioContext.createMediaStreamSource(micStream);
      const micAnalyserNode = audioContext.createAnalyser();
      micAnalyserNode.fftSize = 256;
      micSource.connect(micAnalyserNode);
      micSource.connect(destination);
      setMicAnalyser(micAnalyserNode);

      const systemSource = audioContext.createMediaStreamSource(new MediaStream(systemAudioTracks));
      const systemAnalyserNode = audioContext.createAnalyser();
      systemAnalyserNode.fftSize = 256;
      systemSource.connect(systemAnalyserNode);
      systemSource.connect(destination);
      setSystemAnalyser(systemAnalyserNode);

      const recorder = new MediaRecorder(destination.stream, { mimeType: "audio/webm;codecs=opus" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;

      setElapsed(0);
      setStage("recording");
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (err) {
      cleanupTracksAndTimers();
      setStage("error");
      setErrorMessage(
        err instanceof Error ? err.message : "No se pudo iniciar la grabación."
      );
    }
  }

  async function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    setStage("saving");
    if (timerRef.current) clearInterval(timerRef.current);

    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    recorder.stop();
    await stopped;

    streamsRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    await audioContextRef.current?.close().catch(() => {});
    setMicAnalyser(null);
    setSystemAnalyser(null);

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const buffer = await blob.arrayBuffer();
    const path = await window.api.saveRecording(buffer, "webm");
    const name = path.split(/[\\/]/).pop() ?? "grabacion.webm";

    onContinue({ name, path });
  }

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  });

  return (
    <div className="flex min-h-screen flex-col px-8 py-10">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          disabled={stage === "recording" || stage === "saving"}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        {stage === "intro" && (
          <div className="w-[28rem] text-center">
            <h1 className="text-4xl font-semibold tracking-tight">Grabar reunión</h1>
            <p className="mx-auto mt-4 max-w-sm text-sm text-neutral-500">
              Vamos a pedir acceso a tu micrófono y al audio del sistema, para capturar tanto
              lo que dices tú como al resto de la reunión. Tu sistema operativo puede
              pedirte un permiso — acéptalo para continuar.
            </p>
            <Button onClick={startRecording} className="mt-6 w-full">
              Comenzar grabación
            </Button>
          </div>
        )}

        {stage === "requesting" && (
          <p className="text-sm text-neutral-500">Solicitando acceso a micrófono y audio del sistema...</p>
        )}

        {stage === "recording" && (
          <div className="flex w-[28rem] flex-col items-center gap-8 rounded-2xl border border-neutral-200 p-8 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="font-mono text-3xl tabular-nums tracking-tight">
                {formatElapsed(elapsed)}
              </span>
            </div>

            <div className="w-full space-y-4">
              <div>
                <p className="mb-1.5 text-xs text-neutral-500">Micrófono</p>
                <Waveform analyser={micAnalyser} />
              </div>
              <div>
                <p className="mb-1.5 text-xs text-neutral-500">Sistema</p>
                <Waveform analyser={systemAnalyser} />
              </div>
            </div>

            <Button onClick={stopRecording} className="w-full" icon={<Square size={14} />}>
              Detener
            </Button>
          </div>
        )}

        {stage === "saving" && <p className="text-sm text-neutral-500">Guardando grabación...</p>}

        {stage === "error" && (
          <div className="w-[28rem] text-center">
            <p className="text-sm text-red-500">{errorMessage}</p>
            <Button onClick={startRecording} className="mt-4 w-full">
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
