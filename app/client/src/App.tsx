import React, { useEffect, useState } from "react";
import { useAppStore } from "./store/appStore";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { ChatPage } from "./components/Chat/ChatPage";
import { SettingsPanel } from "./components/Settings/SettingsPanel";

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { settings, loadSettings, updateSettings, error, setError } =
    useAppStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />
      <div className="flex-1 flex flex-col relative">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        )}
        <ChatPage />
      </div>
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
