import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shift } from '../types';
import { formatDateBR, getDayOfWeekName } from '../utils/dateUtils';
import { ArrowRightLeft, X, AlertCircle } from 'lucide-react';

interface SwapRequestModalProps {
  initialShift?: Shift;
  onClose: () => void;
}

export const SwapRequestModal: React.FC<SwapRequestModalProps> = ({ initialShift, onClose }) => {
  const { currentUser, users, shifts, createSwapRequest } = useApp();

  // Shifts of current user
  const userShifts = shifts.filter((s) => s.userId === currentUser.id && s.type !== 'ferias');
  
  const [selectedShiftId, setSelectedShiftId] = useState<string>(
    initialShift?.id || (userShifts[0]?.id ?? '')
  );

  // Other colleagues (excluding manager and self)
  const colleagues = users.filter((u) => u.id !== currentUser.id && u.role === 'colaborador' && u.ativo);
  const [selectedColleagueId, setSelectedColleagueId] = useState<string>(colleagues[0]?.id || '');

  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const chosenShift = shifts.find((s) => s.id === selectedShiftId);
  const chosenColleague = users.find((u) => u.id === selectedColleagueId);

  // Available shifts of the colleague around that date
  const colleagueShifts = shifts.filter(
    (s) => s.userId === selectedColleagueId && s.type !== 'ferias'
  );
  const [colleagueShiftId, setColleagueShiftId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenShift) {
      setError('Selecione qual escala você deseja trocar.');
      return;
    }
    if (!chosenColleague) {
      setError('Selecione o colega para permuta.');
      return;
    }
    if (!motivo.trim()) {
      setError('Por favor, informe a justificativa da troca.');
      return;
    }

    createSwapRequest({
      solicitanteId: currentUser.id,
      solicitanteNome: currentUser.name,
      solicitanteShiftId: chosenShift.id,
      dataEscalaOrigem: chosenShift.date,
      linhaOrigem: chosenShift.linha,
      colegaId: chosenColleague.id,
      colegaNome: chosenColleague.name,
      colegaShiftId: colleagueShiftId || undefined,
      dataEscalaDestino: chosenShift.date,
      motivo: motivo.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Solicitar Permuta de Escala</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A solicitação passará por análise e aprovação do Gestor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Shift to swap */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Qual escala sua você precisa trocar?
            </label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {userShifts.length === 0 && (
                <option value="">Nenhuma escala cadastrada</option>
              )}
              {userShifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatDateBR(s.date)} ({getDayOfWeekName(s.date)}) · {s.startTime} às {s.endTime} · {s.linha}
                </option>
              ))}
            </select>
          </div>

          {/* Colleague */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              2. Com qual colega de equipe você deseja permutar?
            </label>
            <select
              value={selectedColleagueId}
              onChange={(e) => {
                setSelectedColleagueId(e.target.value);
                setColleagueShiftId('');
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {colleagues.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.cargo} ({u.matricula})
                </option>
              ))}
            </select>
          </div>

          {/* Colleague's shift (optional specific shift) */}
          {colleagueShifts.length > 0 && (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Turno do colega a ser assumido por você (Opcional)
              </label>
              <select
                value={colleagueShiftId}
                onChange={(e) => setColleagueShiftId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Apenas transferir meu turno / A definir com o gestor</option>
                {colleagueShifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {formatDateBR(s.date)} ({getDayOfWeekName(s.date)}) · {s.startTime} às {s.endTime} · {s.linha}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              3. Justificativa / Motivo da Troca
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Consulta médica agendada, compromisso particular, permuta combinada previamente..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
            >
              Enviar Solicitação ao Gestor
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
