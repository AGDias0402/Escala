export type UserRole = 'gestor' | 'colaborador';

export type ShiftType = 'trabalho' | 'folga' | 'plantao' | 'ferias' | 'atestado';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  matricula: string;
  cargo: string;
  telefone: string;
  departamento: string;
  cnh?: string;
  validadeCnh?: string;
  ativo: boolean;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  type: ShiftType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDurationMinutes: number;
  linha: string; // ex: "Linha 104 - Polo Petroquímico"
  veiculoPrefixo?: string; // ex: "Carro 4020 - Scania K310"
  pontoApresentacao: string; // ex: "Garagem Central - Plataforma 2"
  observacoes?: string;
  cienciado: boolean;
  cienciadoEm?: string;
  atualizadoPor: string;
  atualizadoEm: string;
}

export interface ShiftSwapRequest {
  id: string;
  solicitanteId: string;
  solicitanteNome: string;
  solicitanteShiftId: string;
  dataEscalaOrigem: string;
  linhaOrigem: string;
  colegaId: string;
  colegaNome: string;
  colegaShiftId?: string;
  dataEscalaDestino: string;
  motivo: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  dataSolicitacao: string;
  respostaGestorEm?: string;
  respostaGestorMotivo?: string;
}

export interface ShiftConflict {
  type: 'interjornada' | 'dupla_escala';
  message: string;
  shiftA: Shift;
  shiftB: Shift;
}
