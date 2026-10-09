import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MyScheduleView } from './components/MyScheduleView';
import { TeamScheduleView } from './components/TeamScheduleView';
import { SwapRequestsView } from './components/SwapRequestsView';
import { ManagerDashboardView } from './components/ManagerDashboardView';
import { Check, Info, Smartphone, Monitor } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, notification, mobileMockupMode, setMobileMockupMode } = useApp();

  const renderContent = () => {
    switch (activeTab) {
      case 'minha_escala':
        return <MyScheduleView />;
      case 'escala_geral':
        return <TeamScheduleView />;
      case 'trocas':
        return <SwapRequestsView />;
      case 'gestao':
        return <ManagerDashboardView />;
      default:
        return <MyScheduleView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] animate-in slide-in-from-top duration-200">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 text-xs font-medium flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="flex-1">{notification}</span>
          </div>
        </div>
      )}

      {/* When Mobile Mockup Mode is active on desktop */}
      {mobileMockupMode ? (
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-900">
          
          {/* Top toolbar */}
          <div className="mb-4 flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Smartphone className="w-4 h-4 text-blue-400" />
              Simulador de Dispositivo Móvel
            </span>
            <button
              onClick={() => setMobileMockupMode(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              Expandir para Tela Cheia
            </button>
          </div>

          {/* Device Frame */}
          <div className="w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[5px] border-slate-800 relative flex flex-col overflow-hidden ring-1 ring-slate-700">
            
            {/* Dynamic Island / Speaker notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-black rounded-full z-50 flex items-center justify-end px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
            </div>

            {/* Inner Phone Screen */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-[34px] flex flex-col overflow-hidden relative">
              <Header />
              
              <main className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-20 safe-area-pb">
                {renderContent()}
              </main>

              <BottomNav />
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2 mb-0.5 shrink-0" />
          </div>

        </div>
      ) : (
        /* Native Fluid Mobile-First Viewport Layout */
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-5 pt-4 pb-24">
            {renderContent()}
          </main>

          <BottomNav />
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
