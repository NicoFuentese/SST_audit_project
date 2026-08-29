"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    window.api.getApiKey().then(setSaved);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <p>Key guardada actualmente: {saved ?? "(ninguna)"}</p>
      <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="API key" />
      <button onClick={() => window.api.setApiKey(key).then(() => setSaved(key))}>
        Guardar
      </button>
    </div>
  );
}