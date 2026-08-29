"use client";
import { useState, useEffect } from "react";
import OnboardingScreen from "./components/OnboardingScreen";
import MainScreen from "./components/MainScreen";

export default function Home() {
  const [ready, setReady] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    window.api.getApiKey().then((key) => {
      setHasApiKey(!!key);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  if (!hasApiKey) {
    return <OnboardingScreen onComplete={() => setHasApiKey(true)} />;
  }

  return <MainScreen />;
}
