import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shift } from '../types';
import { 
  formatDateBR, 
  getDayOfWeekName, 
  getWeekDates, 
  addDays, 
  calculateShiftDuration,
  getMonthYearName
} from '../utils/dateUtils';
import { 
  Clock, 
  Bus, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  ArrowRightLeft, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Coffee,
  Info,
  ShieldAlert
} from 'lucide-react';
import { SwapRequestModal } from './SwapRequestModal';
import { ExportScheduleModal } from './ExportScheduleModal';

export const MyScheduleView: React.FC = () => {
  const { 
    currentUser, 
    shifts, 
    todayDate, 
    acknowledgeShift,
    activeRole 
  } = useApp();

  const [currentWeekRef, setCurrentWeekRef] = useState<string>(todayDate);
  const [viewMode, setViewMode] = useState<'semana' | 'mes'>('semana');
  const [swapModalShift, setSwapModalShift] = useState<Shift | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Filter shifts belonging to current user
  const userShifts = shifts.filter((s) => s.userId === currentUser.id);

  // Today's shift
  const todayShift = userShifts.find((s) => s.date === todayDate);

  // Current week dates
  const weekDates = getWeekDates(currentWeekRef);
  const weekShifts = weekDates.map((date) => {
    const shift = userShifts.find((s) => s.date === date);
    return { date, shift };
  });

  // Calculate week stats
  const totalWorkedHours = weekShifts.reduce((acc, item) => {
    if (item.shift && (item.shift.type === 'trabalho' || item.shift.type === 'plantao')) {
      return acc + calculateShiftDuration(item.shift.startTime, item.shift.endTime, item.shift.breakDurationMinutes);
    }
    return acc;
  }, 0);

  const workDaysCount = weekShifts.filter(
    (item) => item.shift && (item.shift.type === 'trabalho' || item.shift.type === 'plantao')
  ).length;

  const offDaysCount = weekShifts.filter(
    (item) => item.shift && item.shift.type === 'folga'
  ).length;

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekRef((prev) => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const resetToToday = () => {
    setCurrentWeekRef(todayDate);
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Collaborator Profile Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {currentUser.name}
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {currentUser.matricula}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentUser.cargo} · {currentUser.departamento}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Compartilhar / WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Role Notice (Explaining Read-only for collaborator) */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Visualização de Escalas do Colaborador:
          </span>{' '}
          Suas escalas são planejadas e atualizadas pelo Gestor de Tráfego. Você pode confirmar ciência dos seus horários e solicitar permuta com colegas de equipe.
        </div>
      </div>

      {/* TODAY'S SHIFT (HERO CARD) */}
      <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-blue-800/40 relative overflow-hidden">
        
        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Hoje · {formatDateBR(todayDate)} ({getDayOfWeekName(todayDate, 'long')})
              </span>
            </div>
            
            {todayShift && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                todayShift.type === 'folga'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : todayShift.type === 'plantao'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
              }`}>
                {todayShift.type === 'folga' ? 'Folga DSR' : todayShift.type === 'plantao' ? 'Plantão' : 'Em Escala'}
              </span>
            )}
          </div>

          {todayShift ? (
            todayShift.type === 'folga' ? (
              <div className="py-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <Coffee className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Dia de Folga Programada</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                  {todayShift.linha || 'Descanso Semanal Remunerado (DSR).'} Bom descanso!
                </p>
                <div className="mt-4">
                  {!todayShift.cienciado ? (
                    <button
                      onClick={() => acknowledgeShift(todayShift.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-transform active:scale-95 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Ciência da Folga</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ciência confirmada</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Time & Line */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight tabular-nums font-mono text-white">
                      {todayShift.startTime}
                    </span>
                    <span className="text-slate-400 text-sm">às</span>
                    <span className="text-3xl font-extrabold tracking-tight tabular-nums font-mono text-white">
                      {todayShift.endTime}
                    </span>
                    <span className="text-xs text-blue-300 ml-2 font-medium">
                      ({calculateShiftDuration(todayShift.startTime, todayShift.endTime, todayShift.breakDurationMinutes)}h jornada)
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-blue-100 mt-1.5 leading-snug">
                    {todayShift.linha}
                  </h3>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {todayShift.veiculoPrefixo && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <Bus className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-400 block text-[10px]">Veículo Designado</span>
                        <span className="font-semibold text-slate-100 truncate">{todayShift.veiculoPrefixo}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-slate-400 block text-[10px]">Ponto de Apresentação</span>
                      <span className="font-semibold text-slate-100 truncate">{todayShift.pontoApresentacao}</span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {todayShift.observacoes && (
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200">
                    <span className="font-semibold block text-[10px] uppercase text-blue-300 mb-0.5">
                      Instruções do Tráfego:
                    </span>
                    {todayShift.observacoes}
                  </div>
                )}

                {/* Actions: Acknowledge & Swap */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Acknowledge Button */}
                  <div>
                    {!todayShift.cienciado ? (
                      <button
                        onClick={() => acknowledgeShift(todayShift.id)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-transform active:scale-95 shadow-md shadow-emerald-950/50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Ciência da Escala</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Ciência confirmada {todayShift.cienciadoEm ? `em ${new Date(todayShift.cienciadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Swap Request Trigger */}
                  <button
                    onClick={() => setSwapModalShift(todayShift)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>Solicitar Troca de Turno</span>
                  </button>

                </div>

              </div>
            )
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Nenhuma escala cadastrada para hoje. Consulte o gestor de tráfego.
            </div>
          )}

        </div>
      </div>

      {/* WEEK / MONTH NAVIGATION CONTROLS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'semana'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'mes'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Mês
            </button>
          </div>

          {/* Week navigation buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Semana Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={resetToToday}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Esta Semana
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Próxima Semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Week Summary Metrics (KPI Strip) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Horas Previstas
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalWorkedHours.toFixed(1)}h
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Dias de Trabalho
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {workDaysCount} dias
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              Folgas / DSR
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {offDaysCount} folgas
            </span>
          </div>
        </div>

        {/* View Content: Week List vs Month Grid */}
        {viewMode === 'semana' ? (
          <div className="space-y-2.5 pt-2">
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Programação da Semana ({formatDateBR(weekDates[0])} a {formatDateBR(weekDates[6])})
            </h2>

            {weekShifts.map(({ date, shift }) => {
              const isToday = date === todayDate;
              const dayName = getDayOfWeekName(date, 'long');
              const shortDate = formatDateBR(date);

              return (
                <div
                  key={date}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isToday
                      ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    
                    {/* Date info */}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono ${
                        isToday
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        <span className="text-[10px] uppercase font-semibold leading-none">
                          {getDayOfWeekName(date, 'short')}
                        </span>
                        <span className="text-sm font-bold leading-none mt-0.5">
                          {date.split('-')[2]}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {dayName}
                          </span>
                          {isToday && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold">
                              HOJE
                            </span>
                          )}
                        </div>

                        {shift ? (
                          shift.type === 'folga' ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
                              Folga DSR Programada
                            </span>
                          ) : (
                            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {shift.startTime} - {shift.endTime}
                              </span>
                              <span>·</span>
                              <span className="truncate max-w-[180px] sm:max-w-xs">{shift.linha}</span>
                            </div>
                          )
                        ) : (
                          <span className="text-xs text-slate-400 italic">Folga não cadastrada</span>
                        )}
                      </div>
                    </div>

                    {/* Right side: status & action */}
                    <div className="text-right shrink-0">
                      {shift && shift.type !== 'folga' && (
                        <div>
                          {shift.cienciado ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Cienciado</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => acknowledgeShift(shift.id)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-semibold border border-amber-500/30 transition-colors"
                            >
                              Dar Ciência
                            </button>
                          )}
                        </div>
                      )}

                      {shift && (
                        <div className="mt-1">
                          <button
                            onClick={() => setSwapModalShift(shift)}
                            className="text-[10px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 underline transition-colors"
                          >
                            Pedir Troca
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Secondary info bar if shift has vehicle or point */}
                  {shift && shift.type !== 'folga' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
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
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* MONTH VIEW (CALENDAR GRID) */
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {getMonthYearName(todayDate)}
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Trabalho
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Folga
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Plantão
                </span>
              </div>
            </div>

            {/* Calendar header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 pb-2">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Days grid (sample October 2026 month) */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
                const shift = userShifts.find((s) => s.date === dateStr);
                const isToday = dateStr === todayDate;

                return (
                  <div
                    key={dayNum}
                    className={`min-h-[58px] p-1 rounded-xl border flex flex-col justify-between text-left transition-colors ${
                      isToday
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <span className={`text-[11px] font-mono font-bold ${
                      isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayNum}
                    </span>

                    {shift ? (
                      <div className="mt-1">
                        <span className={`text-[9px] block font-semibold px-1 py-0.5 rounded truncate ${
                          shift.type === 'folga'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : shift.type === 'plantao'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {shift.type === 'folga' ? 'Folga' : shift.startTime}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Swap Request Modal */}
      {swapModalShift && (
        <SwapRequestModal
          initialShift={swapModalShift}
          onClose={() => setSwapModalShift(null)}
        />
      )}

      {/* Export Schedule Modal */}
      {showExportModal && (
        <ExportScheduleModal
          user={currentUser}
          shifts={userShifts}
          referenceDate={currentWeekRef}
          onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
};
