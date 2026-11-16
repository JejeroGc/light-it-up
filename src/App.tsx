import { useCallback, useState } from "react";

import LandingPage from "./components/landing/LandingPage";
import SplashScreen from "./components/launcher/SplashScreen";
import TutorialOverlay from "./components/tutorial/TutorialOverlay";
import MainLayout from "./layout/MainLayout";
import { useAppStore } from "./store/appStore";
import AppErrorBoundary from "./components/system/AppErrorBoundary";
import "./App.css";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [editorEntering, setEditorEntering] = useState(false);

  const {
    currentScreen,
    tutorialOpen,
    openLauncher,
    closeTutorial,
  } = useAppStore();

  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleEditorOpen = useCallback(() => {
    setEditorEntering(true);
    window.setTimeout(() => setEditorEntering(false), 520);
  }, []);

  if (showSplash) {
    return <SplashScreen onDone={finishSplash} />;
  }

  if (currentScreen === "launcher") {
    return <LandingPage onEditorOpen={handleEditorOpen} />;
  }

  return (
    <AppErrorBoundary>
      <div className={editorEntering ? "editor-shell editor-shell-entering" : "editor-shell"}>
        <MainLayout onHome={openLauncher} />
        {tutorialOpen && <TutorialOverlay onClose={closeTutorial} />}
      </div>
    </AppErrorBoundary>
  );
}
