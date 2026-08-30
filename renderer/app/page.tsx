"use client";
import { useState, useEffect } from "react";
import OnboardingScreen from "./components/OnboardingScreen";
import MainScreen from "./components/MainScreen";
import SettingsScreen from "./components/SettingsScreen";
import UploadScreen from "./components/UploadScreen";
import ProcessingScreen from "./components/ProcessingScreen";

type Screen = "loading" | "onboarding" | "main" | "settings" | "upload" | "processing";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [processingFileName, setProcessingFileName] = useState("");

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

  if (screen === "upload") {
    return (
      <UploadScreen
        onBack={() => setScreen("main")}
        onContinue={(file) => {
          setProcessingFileName(file.name);
          setScreen("processing");
        }}
      />
    );
  }

  if (screen === "processing") {
    return <ProcessingScreen fileName={processingFileName} />;
  }

  return (
    <MainScreen
      onOpenSettings={() => setScreen("settings")}
      onSelectUpload={() => setScreen("upload")}
    />
  );
}
