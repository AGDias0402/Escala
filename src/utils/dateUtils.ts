import { Shift, ShiftConflict } from '../types';

// Format YYYY-MM-DD to Brazilian readable string
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatShortDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

export function getDayOfWeekName(dateStr: string, format: 'short' | 'long' = 'short'): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.getDay();
  
  const shortNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const longNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  
  return format === 'long' ? longNames[weekday] : shortNames[weekday];
}

export function getMonthYearName(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// Generate an array of dates for a given 7-day week around a reference date
export function getWeekDates(referenceDateStr: string): string[] {
  const [year, month, day] = referenceDateStr.split('-').map(Number);
  const ref = new Date(year, month - 1, day);
  const dayOfWeek = ref.getDay(); // 0 is Sunday, 1 is Monday
  
  // Calculate Monday as start of week (or Sunday if preferred; standard in Brazilian work schedule is Monday)
  // Distance to Monday: if Sunday (0), go back 6 days. Else go back (dayOfWeek - 1) days.
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + diffToMonday);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    dates.push(formatToISODate(current));
  }
  return dates;
}

export function formatToISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return formatToISODate(d);
}

// Calculate hours between two time strings "HH:mm" considering possible break
export function calculateShiftDuration(startTime: string, endTime: string, breakMinutes: number = 0): number {
  if (!startTime || !endTime) return 0;
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  
  let startMinutes = sH * 60 + sM;
  let endMinutes = eH * 60 + eM;
  
  // Overnight shift
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const totalMinutes = Math.max(0, endMinutes - startMinutes - breakMinutes);
  return Math.round((totalMinutes / 60) * 10) / 10;
}

// Check for CLT / Motorista interjornada conflicts (< 11h between consecutive shifts)
export function detectConflicts(shifts: Shift[]): ShiftConflict[] {
  const conflicts: ShiftConflict[] = [];
  const userShiftsMap = new Map<string, Shift[]>();

  shifts.forEach((shift) => {
    if (shift.type === 'folga' || shift.type === 'ferias' || shift.type === 'atestado') return;
    const list = userShiftsMap.get(shift.userId) || [];
    list.push(shift);
    userShiftsMap.set(shift.userId, list);
  });

  userShiftsMap.forEach((userShifts) => {
    // Sort chronologically
    userShifts.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    for (let i = 0; i < userShifts.length; i++) {
      for (let j = i + 1; j < userShifts.length; j++) {
        const a = userShifts[i];
        const b = userShifts[j];

        // Same date conflict (double scheduled)
        if (a.date === b.date) {
          // Check if overlap
          const [asH, asM] = a.startTime.split(':').map(Number);
          const [aeH, aeM] = a.endTime.split(':').map(Number);
          const [bsH, bsM] = b.startTime.split(':').map(Number);
          const [beH, beM] = b.endTime.split(':').map(Number);

          const aStart = asH * 60 + asM;
          const aEnd = aeH < asH ? (aeH + 24) * 60 + aeM : aeH * 60 + aeM;
          const bStart = bsH * 60 + bsM;
          const bEnd = beH < bsH ? (beH + 24) * 60 + beM : beH * 60 + beM;

          if (aStart < bEnd && bStart < aEnd) {
            conflicts.push({
              type: 'dupla_escala',
              message: `Colaborador escalado em dois horários concorrentes no mesmo dia (${formatDateBR(a.date)}).`,
              shiftA: a,
              shiftB: b,
            });
          }
        }

        // Consecutive days interjornada check (< 11 hours rest)
        const nextDay = addDays(a.date, 1);
        if (b.date === nextDay) {
          const [aeH, aeM] = a.endTime.split(':').map(Number);
          const [bsH, bsM] = b.startTime.split(':').map(Number);
          
          let aEndMin = aeH * 60 + aeM;
          // If a ends next day morning
          const [asH] = a.startTime.split(':').map(Number);
          if (aeH < asH) {
            aEndMin += 24 * 60;
          }
          
          const bStartMin = (24 * 60) + (bsH * 60 + bsM);
          const restMinutes = bStartMin - aEndMin;
          const restHours = restMinutes / 60;

          if (restHours < 11 && restHours >= 0) {
            conflicts.push({
              type: 'interjornada',
              message: `Interjornada inferior a 11 horas (${restHours.toFixed(1)}h de descanso entre os dias ${formatShortDateBR(a.date)} e ${formatShortDateBR(b.date)}).`,
              shiftA: a,
              shiftB: b,
            });
          }
        }
      }
    }
  });

  return conflicts;
}
