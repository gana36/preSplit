import React from 'react';
import { AppProvider, useAppStore } from './store';
import { CapturePhase } from './components/CapturePhase';
import { AssignmentPhase } from './components/AssignmentPhase';
import { SettlementPhase } from './components/SettlementPhase';
import { RotateCcw } from 'lucide-react';

import { FinalLogo } from './components/FinalLogo';

const Main: React.FC = () => {
  const { phase, reset } = useAppStore();

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col max-w-md md:max-w-2xl mx-auto shadow-xl bg-white overflow-hidden">
      <header className="px-4 py-3 sm:p-3 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <FinalLogo size={28} className="flex-shrink-0 sm:hidden" />
          <FinalLogo size={32} className="hidden sm:block flex-shrink-0" />
          <div className="flex items-baseline tracking-tight leading-none text-xl min-w-0">
            <span className="font-black text-slate-800">Bill</span>
            <span className="font-light text-slate-800">Beam</span>
          </div>
        </div>
        {phase !== 'capture' && (
          <button
            onClick={reset}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all active:scale-90 flex-shrink-0"
            title="Start Over"
            aria-label="Start Over"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-hidden relative h-full">
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
