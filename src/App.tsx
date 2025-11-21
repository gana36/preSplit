import React from 'react';
import { AppProvider, useAppStore } from './store';
import { CapturePhase } from './components/CapturePhase';
import { AssignmentPhase } from './components/AssignmentPhase';
import { SettlementPhase } from './components/SettlementPhase';

const Main: React.FC = () => {
  const { phase } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-xl bg-white min-h-[100dvh]">
      <header className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SmartSplit
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {phase === 'capture' && <CapturePhase />}
        {phase === 'assignment' && <AssignmentPhase />}
        {phase === 'settlement' && <SettlementPhase />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
}

export default App;
