"use client";
import { useState, useEffect } from "react";
import OnboardingScreen from "./components/OnboardingScreen";
import MainScreen from "./components/MainScreen";
import SettingsScreen from "./components/SettingsScreen";

type Screen = "loading" | "onboarding" | "main" | "settings";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("loading");

  useEffect(() => {
    window.api.getApiKey().then((key) => {
      setScreen(key ? "main" : "onboarding");
    });
  }, []);

  if (screen === "loading") return null;

  if (screen === "onboarding") {
    return <OnboardingScreen onComplete={() => setScreen("main")} />;
  }

  if (screen === "settings") {
    return <SettingsScreen onBack={() => setScreen("main")} />;
  }

  return <MainScreen onOpenSettings={() => setScreen("settings")} />;
}
