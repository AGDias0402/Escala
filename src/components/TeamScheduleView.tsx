import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shift, ShiftType } from '../types';
import { 
  formatDateBR, 
  getDayOfWeekName, 
  getWeekDates, 
  calculateShiftDuration 
} from '../utils/dateUtils';
import { 
  Search, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Bus, 
  MapPin, 
  ShieldAlert, 
  Lock,
  Filter,
  User as UserIcon,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { ShiftModal } from './ShiftModal';
import { PinAuthModal } from './PinAuthModal';

export const TeamScheduleView: React.FC = () => {
  const { 
    shifts, 
    users, 
    activeRole, 
    todayDate, 
    selectedDate, 
    setSelectedDate 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | ShiftType>('all');
  const [modalShift, setModalShift] = useState<Shift | null>(null);
  const [isNewShiftModalOpen, setIsNewShiftModalOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Weekdays bar centered on selected date
  const weekDates = getWeekDates(selectedDate);

  // Collaborators list (exclude gestor from driver roster)
  const collaborators = users.filter((u) => u.role === 'colaborador' && u.ativo);

  // Shifts on selectedDate
  const dayShifts = shifts.filter((s) => s.date === selectedDate);

  // Day summary counts
  const totalTrabalho = dayShifts.filter((s) => s.type === 'trabalho').length;
  const totalFolga = dayShifts.filter((s) => s.type === 'folga').length;
  const totalPlantao = dayShifts.filter((s) => s.type === 'plantao').length;
  const totalCienciado = dayShifts.filter((s) => s.cienciado && s.type !== 'folga').length;

  // Filtered roster
  const filteredCollaborators = collaborators.filter((colab) => {
    const shift = dayShifts.find((s) => s.userId === colab.id);
    
    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'folga') {
        if (shift && shift.type !== 'folga') return false;
        // If no shift is registered, could be considered off
      } else {
        if (!shift || shift.type !== filterType) return false;
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = colab.name.toLowerCase().includes(term);
      const matchMatricula = colab.matricula.toLowerCase().includes(term);
      const matchLinha = shift?.linha.toLowerCase().includes(term);
      const matchVeiculo = shift?.veiculoPrefixo?.toLowerCase().includes(term);
      return matchName || matchMatricula || matchLinha || matchVeiculo;
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Banner / Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Escala Geral da Equipe
            </h1>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              activeRole === 'gestor' 
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {activeRole === 'gestor' ? 'Modo Edição Ativo' : 'Somente Leitura'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quadro operacional diário de motoristas, serviços e frotas
          </p>
        </div>

        {/* Manager Action: Add Shift */}
        <div className="flex items-center gap-2">
          {activeRole === 'gestor' ? (
            <button
              onClick={() => setIsNewShiftModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Escala</span>
            </button>
          ) : (
            <button
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              title="Para editar, acesse o modo gestor com PIN"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Editar (Acesso Gestor)</span>
            </button>
          )}
        </div>
      </div>

      {/* HORIZONTAL WEEKDAY SELECTOR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {formatDateBR(selectedDate)} ({getDayOfWeekName(selectedDate, 'long')})
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDates.map((d) => {
            const isSelected = d === selectedDate;
            const isToday = d === todayDate;
            const dayNum = d.split('-')[2];
            const shortWeek = getDayOfWeekName(d, 'short');

            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-md scale-[1.02]'
                    : isToday
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className={`text-[10px] uppercase font-semibold leading-none ${
                  isSelected ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  {shortWeek}
                </span>
                <span className="text-sm font-bold font-mono mt-1 leading-none">
                  {dayNum}
                </span>
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DAY STATS STRIP */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Trabalho</span>
          <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">{totalTrabalho}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Folgas</span>
          <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{totalFolga}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Plantão</span>
          <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{totalPlantao}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cienciados</span>
          <span className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
            {totalCienciado}/{totalTrabalho + totalPlantao}
          </span>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por motorista, matrícula, linha ou carro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'trabalho', label: 'Em Trabalho' },
            { id: 'folga', label: 'Folgas' },
            { id: 'plantao', label: 'Plantões' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterType === f.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* COLLABORATOR SHIFT CARDS */}
      <div className="space-y-3">
        {filteredCollaborators.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Nenhum colaborador encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredCollaborators.map((colab) => {
            const shift = dayShifts.find((s) => s.userId === colab.id);

            return (
              <div
                key={colab.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Header: Collaborator info & Actions */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                      {colab.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {colab.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {colab.matricula}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {colab.cargo}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Shift status & Edit button */}
                  <div className="flex items-center gap-2">
                    {shift ? (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        shift.type === 'folga'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : shift.type === 'plantao'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}>
                        {shift.type === 'folga' ? 'Folga DSR' : shift.type === 'plantao' ? 'Plantão' : 'Trabalho'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Sem Escala
                      </span>
                    )}

                    {/* Manager edit trigger */}
                    {activeRole === 'gestor' && (
                      <button
                        onClick={() => {
                          if (shift) {
                            setModalShift(shift);
                          } else {
                            // Open creation modal with this collaborator preselected
                            setModalShift({
                              id: '',
                              userId: colab.id,
                              userName: colab.name,
                              date: selectedDate,
                              type: 'trabalho',
                              startTime: '06:00',
                              endTime: '15:00',
                              breakDurationMinutes: 60,
                              linha: 'Linha 201 - Fretamento Industrial Polo Leste',
                              pontoApresentacao: 'Garagem Central - Setor A',
                              cienciado: false,
                              atualizadoPor: '',
                              atualizadoEm: '',
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-900 transition-colors"
                        title={shift ? 'Editar escala' : 'Criar escala'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body: Shift details */}
                {shift ? (
                  shift.type === 'folga' ? (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Coffee className="w-4 h-4" />
                        <span>{shift.linha || 'Folga Semanal Remunerada (DSR)'}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Escala de descanso</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                      
                      {/* Times & Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {shift.startTime} às {shift.endTime}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ({calculateShiftDuration(shift.startTime, shift.endTime, shift.breakDurationMinutes)}h)
                          </span>
                        </div>

                        {/* Science badge */}
                        <div>
                          {shift.cienciado ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Colaborador Cienciado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Aguardando Ciência</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Line Name */}
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {shift.linha}
                      </div>

                      {/* Vehicle & Presentation point */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-750">
                        {shift.veiculoPrefixo && (
                          <span className="flex items-center gap-1">
                            <Bus className="w-3 h-3 text-slate-400" />
                            <strong className="text-slate-700 dark:text-slate-300">{shift.veiculoPrefixo}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{shift.pontoApresentacao}</span>
                        </span>
                      </div>

                      {/* Observations */}
                      {shift.observacoes && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-slate-750">
                          Obs: {shift.observacoes}
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Nenhuma escala lançada para este dia</span>
                    {activeRole === 'gestor' && (
                      <button
                        onClick={() => {
                          setModalShift({
                            id: '',
                            userId: colab.id,
                            userName: colab.name,
                            date: selectedDate,
                            type: 'trabalho',
                            startTime: '06:00',
                            endTime: '15:00',
                            breakDurationMinutes: 60,
                            linha: 'Linha 201 - Fretamento Industrial Polo Leste',
                            pontoApresentacao: 'Garagem Central - Setor A',
                            cienciado: false,
                            atualizadoPor: '',
                            atualizadoEm: '',
                          });
                        }}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-[11px]"
                      >
                        + Escalar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Shift Modal */}
      {modalShift && (
        <ShiftModal
          shiftToEdit={modalShift.id ? modalShift : null}
          defaultDate={selectedDate}
          onClose={() => setModalShift(null)}
        />
      )}

      {/* New Shift Modal */}
      {isNewShiftModalOpen && (
        <ShiftModal
          defaultDate={selectedDate}
          onClose={() => setIsNewShiftModalOpen(false)}
        />
      )}

      {/* PIN Auth Modal */}
      {showPinModal && (
        <PinAuthModal onClose={() => setShowPinModal(false)} />
      )}

    </div>
  );
};
