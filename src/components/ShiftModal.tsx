import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shift, ShiftType } from '../types';
import { PRESET_LINES, PRESET_VEHICLES, PRESET_PRESENTATION_POINTS } from '../data/mockData';
import { formatDateBR, calculateShiftDuration, addDays } from '../utils/dateUtils';
import { X, Calendar, Clock, Bus, MapPin, AlertTriangle, Check, Trash2 } from 'lucide-react';

interface ShiftModalProps {
  shiftToEdit?: Shift | null;
  defaultDate?: string;
  onClose: () => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  shiftToEdit,
  defaultDate,
  onClose,
}) => {
  const { users, shifts, addShift, updateShift, deleteShift, todayDate } = useApp();

  const activeCollaborators = users.filter((u) => u.role === 'colaborador' && u.ativo);

  const [userId, setUserId] = useState<string>(
    shiftToEdit ? shiftToEdit.userId : activeCollaborators[0]?.id || ''
  );
  const [date, setDate] = useState<string>(
    shiftToEdit ? shiftToEdit.date : defaultDate || todayDate
  );
  const [type, setType] = useState<ShiftType>(shiftToEdit ? shiftToEdit.type : 'trabalho');
  const [startTime, setStartTime] = useState<string>(shiftToEdit ? shiftToEdit.startTime : '06:00');
  const [endTime, setEndTime] = useState<string>(shiftToEdit ? shiftToEdit.endTime : '15:00');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState<number>(
    shiftToEdit ? shiftToEdit.breakDurationMinutes : 60
  );
  const [linha, setLinha] = useState<string>(
    shiftToEdit ? shiftToEdit.linha : PRESET_LINES[0]
  );
  const [customLinha, setCustomLinha] = useState<string>('');
  const [veiculoPrefixo, setVeiculoPrefixo] = useState<string>(
    shiftToEdit ? shiftToEdit.veiculoPrefixo || '' : PRESET_VEHICLES[0]
  );
  const [customVeiculo, setCustomVeiculo] = useState<string>('');
  const [pontoApresentacao, setPontoApresentacao] = useState<string>(
    shiftToEdit ? shiftToEdit.pontoApresentacao : PRESET_PRESENTATION_POINTS[0]
  );
  const [observacoes, setObservacoes] = useState<string>(
    shiftToEdit ? shiftToEdit.observacoes || '' : ''
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedUser = users.find((u) => u.id === userId);

  // Check for potential conflicts before saving
  const existingSameDayShift = shifts.find(
    (s) => s.userId === userId && s.date === date && s.id !== shiftToEdit?.id
  );

  const calculatedHours = type === 'folga' 
    ? 0 
    : calculateShiftDuration(startTime, endTime, breakDurationMinutes);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const finalLinha = customLinha.trim() || linha;
    const finalVeiculo = customVeiculo.trim() || veiculoPrefixo;

    if (shiftToEdit) {
      updateShift(shiftToEdit.id, {
        userId,
        userName: selectedUser.name,
        date,
        type,
        startTime: type === 'folga' ? '00:00' : startTime,
        endTime: type === 'folga' ? '23:59' : endTime,
        breakDurationMinutes: type === 'folga' ? 0 : breakDurationMinutes,
        linha: type === 'folga' ? (finalLinha.includes('Folga') || finalLinha.includes('DSR') ? finalLinha : 'Folga Escalar DSR') : finalLinha,
        veiculoPrefixo: type === 'folga' ? undefined : finalVeiculo,
        pontoApresentacao: type === 'folga' ? 'Residência' : pontoApresentacao,
        observacoes: observacoes.trim() || undefined,
      });
    } else {
      addShift({
        userId,
        userName: selectedUser.name,
        date,
        type,
        startTime: type === 'folga' ? '00:00' : startTime,
        endTime: type === 'folga' ? '23:59' : endTime,
        breakDurationMinutes: type === 'folga' ? 0 : breakDurationMinutes,
        linha: type === 'folga' ? (finalLinha.includes('Folga') || finalLinha.includes('DSR') ? finalLinha : 'Folga Escalar DSR') : finalLinha,
        veiculoPrefixo: type === 'folga' ? undefined : finalVeiculo,
        pontoApresentacao: type === 'folga' ? 'Residência' : pontoApresentacao,
        observacoes: observacoes.trim() || undefined,
        cienciado: false,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (shiftToEdit) {
      deleteShift(shiftToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-bold">
              {shiftToEdit ? 'Editar Escala Operacional' : 'Criar Nova Escala Operacional'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controle exclusivo de Gestor de Tráfego
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Shift Alert */}
        {existingSameDayShift && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <span className="font-semibold block">Atenção: Colaborador já possui escala nesta data!</span>
              <span>
                Já consta escala ({existingSameDayShift.startTime} às {existingSameDayShift.endTime} - {existingSameDayShift.linha}). Salvar irá sobrepor ou gerar duplicidade.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Collaborator & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Colaborador / Motorista *
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {activeCollaborators.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.matricula})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data da Escala *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Shift Type */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tipo de Escala
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'trabalho', label: 'Trabalho' },
                { id: 'folga', label: 'Folga DSR' },
                { id: 'plantao', label: 'Plantão' },
                { id: 'ferias', label: 'Férias' },
                { id: 'atestado', label: 'Atestado' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id as ShiftType)}
                  className={`py-2 px-2 text-center rounded-xl font-semibold transition-all border ${
                    type === t.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Times (if not folga) */}
          {type !== 'folga' && type !== 'ferias' && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Início (Hora)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Término (Hora)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Intervalo (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={breakDurationMinutes}
                    onChange={(e) => setBreakDurationMinutes(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                  />
                </div>
              </div>

              <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center justify-between">
                <span>Cálculo da Jornada Líquida:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {calculatedHours.toFixed(1)} horas de trabalho
                </span>
              </div>
            </div>
          )}

          {/* Linha / Serviço */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {type === 'folga' ? 'Descrição da Folga' : 'Linha / Rota / Serviço'}
            </label>
            <select
              value={linha}
              onChange={(e) => setLinha(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium mb-1.5"
            >
              {PRESET_LINES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Ou digite outra linha / serviço customizado..."
              value={customLinha}
              onChange={(e) => setCustomLinha(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs"
            />
          </div>

          {/* Veículo & Ponto de Apresentação (if work/plantão) */}
          {type !== 'folga' && type !== 'ferias' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Veículo / Prefixo
                </label>
                <select
                  value={veiculoPrefixo}
                  onChange={(e) => setVeiculoPrefixo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mb-1.5"
                >
                  <option value="">Sem veículo fixo (Reserva)</option>
                  {PRESET_VEHICLES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ou outro prefixo..."
                  value={customVeiculo}
                  onChange={(e) => setCustomVeiculo(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ponto de Apresentação
                </label>
                <select
                  value={pontoApresentacao}
                  onChange={(e) => setPontoApresentacao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {PRESET_PRESENTATION_POINTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observações Operacionais para o Colaborador (Opcional)
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Instruções de embarque, clientes específicos, uniforme, etc."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {shiftToEdit ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
                  >
                    Confirmar Exclusão
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-2 text-slate-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
              >
                {shiftToEdit ? 'Salvar Alterações' : 'Cadastrar Escala'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
