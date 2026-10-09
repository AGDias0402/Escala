import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Users, ArrowRightLeft, ShieldCheck, Lock } from 'lucide-react';
import { PinAuthModal } from './PinAuthModal';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeRole, swapRequests } = useApp();
  const [showPinModal, setShowPinModal] = useState(false);

  const pendingSwapsCount = swapRequests.filter((r) => r.status === 'pendente').length;

  const handleGestaoTabClick = () => {
    if (activeRole === 'gestor') {
      setActiveTab('gestao');
    } else {
      setShowPinModal(true);
    }
  };

  return (
    <>
      <nav 
        aria-label="Navegação Principal"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg safe-area-pb"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4 items-center h-16 px-1">
          
          {/* Tab 1: Minha Escala */}
          <button
            onClick={() => setActiveTab('minha_escala')}
            className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors ${
              activeTab === 'minha_escala'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === 'minha_escala' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight mt-1">Minha Escala</span>
            {activeTab === 'minha_escala' && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          {/* Tab 2: Escala Geral */}
          <button
            onClick={() => setActiveTab('escala_geral')}
            className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors ${
              activeTab === 'escala_geral'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'escala_geral' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight mt-1">Geral / Equipe</span>
            {activeTab === 'escala_geral' && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          {/* Tab 3: Trocas */}
          <button
            onClick={() => setActiveTab('trocas')}
            className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors ${
              activeTab === 'trocas'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <ArrowRightLeft className={`w-5 h-5 ${activeTab === 'trocas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {pendingSwapsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingSwapsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">Trocas</span>
            {activeTab === 'trocas' && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          {/* Tab 4: Gestão */}
          <button
            onClick={handleGestaoTabClick}
            className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors ${
              activeTab === 'gestao'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {activeRole === 'gestor' ? (
                <ShieldCheck className={`w-5 h-5 ${activeTab === 'gestao' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              ) : (
                <Lock className="w-5 h-5 opacity-70" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">
              {activeRole === 'gestor' ? 'Gestão' : 'Área Gestor'}
            </span>
            {activeTab === 'gestao' && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </button>

        </div>
      </nav>

      {showPinModal && (
        <PinAuthModal onClose={() => setShowPinModal(false)} />
      )}
    </>
  );
};
