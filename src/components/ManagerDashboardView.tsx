import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shift, User } from '../types';
import { 
  detectConflicts, 
  formatDateBR, 
  getWeekDates, 
  addDays, 
  getDayOfWeekName 
} from '../utils/dateUtils';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Users, 
  KeyRound, 
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Edit3, 
  UserCheck,
  Share2
} from 'lucide-react';
import { ShiftModal } from './ShiftModal';
import { CollaboratorModal } from './CollaboratorModal';
import { ExportScheduleModal } from './ExportScheduleModal';

export const ManagerDashboardView: React.FC = () => {
  const { 
    shifts, 
    users, 
    activeRole, 
    todayDate, 
    duplicateWeekShifts, 
    changeGestorPin, 
    gestorPin,
    showToast 
  } = useApp();

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [collabModalUser, setCollabModalUser] = useState<User | null>(null);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [exportUser, setExportUser] = useState<User | null>(null);

  // Clone week states
  const [cloneSourceDate, setCloneSourceDate] = useState<string>(todayDate);
  const [cloneTargetDate, setCloneTargetDate] = useState<string>(addDays(todayDate, 7));

  // Change PIN states
  const [showPinChange, setShowPinChange] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  // Conflicts audit
  const conflicts = detectConflicts(shifts);

  const activeCollaborators = users.filter((u) => u.role === 'colaborador');

  const handleDuplicateWeek = () => {
    const res = duplicateWeekShifts(cloneSourceDate, cloneTargetDate);
    if (res.count > 0) {
      showToast(`Sucesso! ${res.count} escalas clonadas para a próxima semana.`);
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = changeGestorPin(oldPin, newPin);
    if (success) {
      setShowPinChange(false);
      setOldPin('');
      setNewPin('');
    } else {
      showToast('PIN atual incorreto ou novo PIN com menos de 4 dígitos.');
    }
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Dashboard Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold">Painel do Gestor de Tráfego</h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Acesso Total
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Criação, auditoria de interjornada, clonagem e gestão da equipe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingShift(null);
                setIsShiftModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Escala</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. CONFLICTS AUDIT (AUDITORIA DE INTERJORNADA / LEI 13.103 MOTORISTAS) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${conflicts.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Auditoria de Escalas (Interjornada CLT & Conflitos)
            </h2>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
            conflicts.length > 0 
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' 
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}>
            {conflicts.length === 0 ? 'Tudo em Conformidade (0 Conflitos)' : `${conflicts.length} Atenção Requerida`}
          </span>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Nenhum conflito de interjornada ou escala dupla detectado nas programações ativas.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {conflicts.map((conf, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {conf.shiftA.userName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-semibold uppercase">
                      {conf.type === 'interjornada' ? 'Descanso < 11h' : 'Sobreposição'}
                    </span>
                  </div>
                  <p className="text-amber-900 dark:text-amber-200 mt-0.5">
                    {conf.message}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingShift(conf.shiftB);
                    setIsShiftModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shrink-0 self-start sm:self-center transition-colors"
                >
                  Ajustar Escala
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. DUPLICATE WEEK TOOL (PRODUTIVIDADE) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Duplicar Escalas da Semana (Clonagem Rápida)
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Replica toda a escala de motoristas, veículos e linhas da semana de referência para a semana seguinte com um clique.
        </p>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                Semana Origem (Base)
              </span>
              <input
                type="date"
                value={cloneSourceDate}
                onChange={(e) => setCloneSourceDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs font-semibold"
              />
            </div>

            <span className="text-slate-400 hidden sm:inline">➜</span>

            <div>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                Semana Destino (Próxima)
              </span>
              <input
                type="date"
                value={cloneTargetDate}
                onChange={(e) => setCloneTargetDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs font-semibold"
              />
            </div>
          </div>

          <button
            onClick={handleDuplicateWeek}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-colors shrink-0"
          >
            Executar Clonagem
          </button>
        </div>
      </div>

      {/* 3. ROSTER / COLLABORATORS MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Quadro de Colaboradores & Motoristas ({activeCollaborators.length})
            </h2>
          </div>

          <button
            onClick={() => {
              setCollabModalUser(null);
              setIsCollabModalOpen(true);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Motorista</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeCollaborators.map((u) => {
            const userShiftCount = shifts.filter((s) => s.userId === u.id).length;

            return (
              <div
                key={u.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {u.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {u.matricula}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {u.cargo} {u.cnh ? `· CNH: ${u.cnh.split('-')[0]}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExportUser(u)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                    title="Exportar escala do motorista via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setCollabModalUser(u);
                      setIsCollabModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                    title="Editar dados"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PIN SECURITY SETTINGS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Segurança do Modo Gestor (PIN)
            </h2>
          </div>
          <button
            onClick={() => setShowPinChange(!showPinChange)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showPinChange ? 'Ocultar' : 'Alterar PIN'}
          </button>
        </div>

        {showPinChange && (
          <form onSubmit={handleSaveNewPin} className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
            <input
              type="password"
              placeholder="PIN Atual"
              maxLength={6}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold"
              required
            />
            <input
              type="password"
              placeholder="Novo PIN (mín 4 dígitos)"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-center font-bold"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Salvar PIN
            </button>
          </form>
        )}
      </div>

      {/* Shift Modal */}
      {(isShiftModalOpen || editingShift) && (
        <ShiftModal
          shiftToEdit={editingShift}
          defaultDate={todayDate}
          onClose={() => {
            setIsShiftModalOpen(false);
            setEditingShift(null);
          }}
        />
      )}

      {/* Collaborator Modal */}
      {isCollabModalOpen && (
        <CollaboratorModal
          collaboratorToEdit={collabModalUser}
          onClose={() => {
            setIsCollabModalOpen(false);
            setCollabModalUser(null);
          }}
        />
      )}

      {/* Export Modal */}
      {exportUser && (
        <ExportScheduleModal
          user={exportUser}
          shifts={shifts.filter((s) => s.userId === exportUser.id)}
          referenceDate={todayDate}
          onClose={() => setExportUser(null)}
        />
      )}

    </div>
  );
};
