import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  ShieldAlert, 
  User as UserIcon, 
  Smartphone, 
  Monitor, 
  Lock, 
  Unlock, 
  RefreshCw,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { PinAuthModal } from './PinAuthModal';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    activeRole, 
    isGestorUnlocked, 
    users, 
    switchUser, 
    lockGestorMode, 
    mobileMockupMode, 
    setMobileMockupMode,
    swapRequests,
    setActiveTab,
    resetAllData
  } = useApp();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pendingSwapsCount = swapRequests.filter((r) => r.status === 'pendente').length;

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base sm:text-lg text-white">EscalaFácil</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  Tráfego & Fretamento
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Visualização do Colaborador · Edição Exclusiva do Gestor
              </p>
            </div>
          </div>

          {/* Center/Right Controls */}
          <div className="flex items-center gap-2">
            
            {/* Viewport Frame Toggle (Desktop helper) */}
            <button
              onClick={() => setMobileMockupMode((prev) => !prev)}
              title={mobileMockupMode ? 'Mudar para modo Expandido' : 'Simular tela de Smartphone'}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              {mobileMockupMode ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  <span>Tela Cheia</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Simular Celular</span>
                </>
              )}
            </button>

            {/* Pending swap badge for manager */}
            {activeRole === 'gestor' && pendingSwapsCount > 0 && (
              <button
                onClick={() => setActiveTab('trocas')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 transition-colors"
                title={`${pendingSwapsCount} troca(s) pendente(s) de aprovação`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="tabular-nums font-bold">{pendingSwapsCount}</span>
                <span className="hidden sm:inline">troca(s)</span>
              </button>
            )}

            {/* Role indicator & Lock status */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeRole === 'gestor'
                    ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-200 hover:bg-emerald-900/80'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {activeRole === 'gestor' ? (
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span className="max-w-[110px] sm:max-w-[160px] truncate font-semibold">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>

                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  activeRole === 'gestor' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {activeRole === 'gestor' ? 'GESTOR (Edição)' : 'COLABORADOR (Visualização)'}
                </span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Usuário Atual
                    </p>
                    <p className="font-semibold text-white text-sm truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400">{currentUser.cargo} · {currentUser.matricula}</p>
                  </div>

                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Alternar Perfil
                    </p>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          if (u.role === 'gestor' && !isGestorUnlocked) {
                            setIsPinModalOpen(true);
                          } else {
                            switchUser(u.id);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          u.id === currentUser.id ? 'bg-blue-950/60 text-blue-300 font-semibold' : ''
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium text-white truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.cargo}</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          u.role === 'gestor' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-2 px-2 flex flex-col gap-1">
                    {activeRole === 'gestor' ? (
                      <button
                        onClick={lockGestorMode}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-950/40 rounded-lg transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Bloquear Modo Gestor</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsPinModalOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-950/50 rounded-lg transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Desbloquear Modo Gestor (PIN)</span>
                      </button>
                    )}

                    <button
                      onClick={resetAllData}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restaurar Dados Padrão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick PIN Trigger if collaborator */}
            {activeRole !== 'gestor' && (
              <button
                onClick={() => setIsPinModalOpen(true)}
                title="Acessar Modo Gestor com PIN"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Acesso Gestor</span>
              </button>
            )}

            {/* Quick Lock trigger if manager */}
            {activeRole === 'gestor' && (
              <button
                onClick={lockGestorMode}
                title="Sair do Modo Gestor (Bloquear)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 rounded-lg border border-emerald-700 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Sair Gestor</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Pin Authentication Modal */}
      {isPinModalOpen && (
        <PinAuthModal onClose={() => setIsPinModalOpen(false)} />
      )}
    </>
  );
};
