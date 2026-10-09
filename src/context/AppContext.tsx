import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Shift, ShiftSwapRequest, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_SHIFTS, INITIAL_SWAP_REQUESTS } from '../data/mockData';
import { addDays, getWeekDates } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User;
  activeRole: UserRole;
  isGestorUnlocked: boolean;
  gestorPin: string;
  users: User[];
  shifts: Shift[];
  swapRequests: ShiftSwapRequest[];
  todayDate: string;
  selectedDate: string;
  activeTab: 'minha_escala' | 'escala_geral' | 'trocas' | 'gestao';
  mobileMockupMode: boolean;
  notification: string | null;

  // Actions
  setActiveTab: (tab: 'minha_escala' | 'escala_geral' | 'trocas' | 'gestao') => void;
  setSelectedDate: (date: string) => void;
  setMobileMockupMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  switchUser: (userId: string) => void;
  unlockGestorMode: (pin: string) => boolean;
  lockGestorMode: () => void;
  changeGestorPin: (oldPin: string, newPin: string) => boolean;

  // Shift Actions (Gestor only)
  addShift: (shiftData: Omit<Shift, 'id' | 'atualizadoEm' | 'atualizadoPor'>) => boolean;
  updateShift: (id: string, shiftData: Partial<Shift>) => boolean;
  deleteShift: (id: string) => boolean;
  duplicateWeekShifts: (sourceReferenceDate: string, targetReferenceDate: string) => { count: number };

  // Collaborator Actions
  acknowledgeShift: (shiftId: string) => void;
  createSwapRequest: (data: Omit<ShiftSwapRequest, 'id' | 'status' | 'dataSolicitacao'>) => void;
  respondSwapRequest: (requestId: string, status: 'aprovada' | 'rejeitada', motivo?: string) => void;

  // Collaborator Management (Gestor only)
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;

  // System
  showToast: (msg: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'escalafacil_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const TODAY_ANCHOR = '2026-10-09'; // Anchor date corresponding to local context

  // Initialize Users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current User (default: first collaborator)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user_id`);
      return stored || 'user_1';
    } catch {
      return 'user_1';
    }
  });

  // Gestor Unlock State
  const [isGestorUnlocked, setIsGestorUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY_PREFIX}gestor_unlocked`) === 'true';
    } catch {
      return false;
    }
  });

  const [gestorPin, setGestorPin] = useState<string>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY_PREFIX}gestor_pin`) || '1234';
    } catch {
      return '1234';
    }
  });

  // Shifts
  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}shifts`);
      return stored ? JSON.parse(stored) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  // Swap requests
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}swaps`);
      return stored ? JSON.parse(stored) : INITIAL_SWAP_REQUESTS;
    } catch {
      return INITIAL_SWAP_REQUESTS;
    }
  });

  const [todayDate] = useState<string>(TODAY_ANCHOR);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_ANCHOR);
  const [activeTab, setActiveTab] = useState<'minha_escala' | 'escala_geral' | 'trocas' | 'gestao'>('minha_escala');
  const [mobileMockupMode, setMobileMockupMode] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}shifts`, JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}swaps`, JSON.stringify(swapRequests));
  }, [swapRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user_id`, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}gestor_unlocked`, isGestorUnlocked ? 'true' : 'false');
  }, [isGestorUnlocked]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}gestor_pin`, gestorPin);
  }, [gestorPin]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const currentUser = users.find((u) => u.id === currentUserId) || users[1] || users[0];
  
  // Active role: Gestor only if current user is gestor AND is unlocked, or if role is gestor
  const activeRole: UserRole = currentUser.role === 'gestor' && isGestorUnlocked ? 'gestor' : 'colaborador';

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setCurrentUserId(userId);
    if (target.role === 'gestor') {
      // If switching to gestor, check if unlocked
      if (!isGestorUnlocked) {
        showToast('Identificado como Gestor. Insira o PIN para habilitar a edição.');
      }
    } else {
      showToast(`Visualizando perfil de: ${target.name}`);
    }
  };

  const unlockGestorMode = (pin: string): boolean => {
    if (pin === gestorPin) {
      setIsGestorUnlocked(true);
      // Switch current user to gestor if not already
      const gestorUser = users.find((u) => u.role === 'gestor');
      if (gestorUser) {
        setCurrentUserId(gestorUser.id);
      }
      showToast('Modo Gestor Desbloqueado com sucesso! Edição liberada.');
      return true;
    }
    return false;
  };

  const lockGestorMode = () => {
    setIsGestorUnlocked(false);
    // Switch to first collaborator
    const firstColab = users.find((u) => u.role === 'colaborador');
    if (firstColab) {
      setCurrentUserId(firstColab.id);
    }
    setActiveTab('minha_escala');
    showToast('Modo Gestor bloqueado. Retornado para modo Colaborador.');
  };

  const changeGestorPin = (oldPin: string, newPin: string): boolean => {
    if (oldPin === gestorPin && newPin.length >= 4) {
      setGestorPin(newPin);
      showToast('PIN de segurança do Gestor alterado com sucesso!');
      return true;
    }
    return false;
  };

  // SHIFT MANAGEMENT (Gestor strictly protected)
  const addShift = (shiftData: Omit<Shift, 'id' | 'atualizadoEm' | 'atualizadoPor'>): boolean => {
    if (activeRole !== 'gestor') {
      showToast('Apenas o gestor tem autorização para criar ou editar escalas.');
      return false;
    }

    const newShift: Shift = {
      ...shiftData,
      id: `shift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      atualizadoPor: `${currentUser.name} (Gestor)`,
      atualizadoEm: new Date().toISOString(),
    };

    setShifts((prev) => [...prev, newShift]);
    showToast(`Escala de ${newShift.userName} adicionada com sucesso.`);
    return true;
  };

  const updateShift = (id: string, shiftData: Partial<Shift>): boolean => {
    if (activeRole !== 'gestor') {
      showToast('Apenas o gestor tem autorização para editar escalas.');
      return false;
    }

    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            ...shiftData,
            atualizadoPor: `${currentUser.name} (Gestor)`,
            atualizadoEm: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    showToast('Escala atualizada com sucesso.');
    return true;
  };

  const deleteShift = (id: string): boolean => {
    if (activeRole !== 'gestor') {
      showToast('Apenas o gestor tem autorização para excluir escalas.');
      return false;
    }

    setShifts((prev) => prev.filter((s) => s.id !== id));
    showToast('Escala removida com sucesso.');
    return true;
  };

  const duplicateWeekShifts = (sourceReferenceDate: string, targetReferenceDate: string): { count: number } => {
    if (activeRole !== 'gestor') {
      showToast('Ação exclusiva do gestor.');
      return { count: 0 };
    }

    const sourceWeek = getWeekDates(sourceReferenceDate);
    const targetWeek = getWeekDates(targetReferenceDate);

    // Collect all shifts in source week
    const sourceShifts = shifts.filter((s) => sourceWeek.includes(s.date));
    if (sourceShifts.length === 0) {
      showToast('Nenhuma escala encontrada na semana de origem para duplicar.');
      return { count: 0 };
    }

    // Build new shifts mapped by weekday index
    const newShifts: Shift[] = [];
    sourceShifts.forEach((s) => {
      const dayIdx = sourceWeek.indexOf(s.date);
      if (dayIdx !== -1 && targetWeek[dayIdx]) {
        newShifts.push({
          ...s,
          id: `shift_clone_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          date: targetWeek[dayIdx],
          cienciado: false,
          cienciadoEm: undefined,
          atualizadoPor: `${currentUser.name} (Gestor - Clone)`,
          atualizadoEm: new Date().toISOString(),
        });
      }
    });

    // Remove existing shifts on the target week for the duplicated people, or append
    setShifts((prev) => {
      // Keep shifts not in target week
      const filtered = prev.filter((s) => !targetWeek.includes(s.date));
      return [...filtered, ...newShifts];
    });

    showToast(`Semana duplicada com sucesso! ${newShifts.length} escalas geradas.`);
    return { count: newShifts.length };
  };

  // COLLABORATOR ACTIONS
  const acknowledgeShift = (shiftId: string) => {
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          return {
            ...s,
            cienciado: true,
            cienciadoEm: new Date().toISOString(),
          };
        }
        return s;
      })
    );
    showToast('Ciência confirmada! Horário registrado.');

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Ignored if confetti fails
    }
  };

  const createSwapRequest = (data: Omit<ShiftSwapRequest, 'id' | 'status' | 'dataSolicitacao'>) => {
    const newRequest: ShiftSwapRequest = {
      ...data,
      id: `swap_${Date.now()}`,
      status: 'pendente',
      dataSolicitacao: new Date().toISOString(),
    };

    setSwapRequests((prev) => [newRequest, ...prev]);
    showToast('Solicitação de troca enviada ao Gestor com sucesso.');
  };

  const respondSwapRequest = (requestId: string, status: 'aprovada' | 'rejeitada', motivo?: string) => {
    if (activeRole !== 'gestor') {
      showToast('Apenas o gestor pode aprovar ou rejeitar trocas de escala.');
      return;
    }

    const targetReq = swapRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // If approved, perform the shift swap
    if (status === 'aprovada') {
      setShifts((prev) => {
        return prev.map((s) => {
          // If solicitante shift, assign to colega
          if (s.id === targetReq.solicitanteShiftId) {
            return {
              ...s,
              userId: targetReq.colegaId,
              userName: targetReq.colegaNome,
              cienciado: false,
              observacoes: `Permuta aprovada pelo gestor. De: ${targetReq.solicitanteNome}. ${s.observacoes || ''}`,
              atualizadoPor: `${currentUser.name} (Gestor)`,
              atualizadoEm: new Date().toISOString(),
            };
          }
          // If colega had an explicit shift to swap with
          if (targetReq.colegaShiftId && s.id === targetReq.colegaShiftId) {
            return {
              ...s,
              userId: targetReq.solicitanteId,
              userName: targetReq.solicitanteNome,
              cienciado: false,
              observacoes: `Permuta aprovada pelo gestor. De: ${targetReq.colegaNome}. ${s.observacoes || ''}`,
              atualizadoPor: `${currentUser.name} (Gestor)`,
              atualizadoEm: new Date().toISOString(),
            };
          }
          return s;
        });
      });
    }

    setSwapRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              respostaGestorEm: new Date().toISOString(),
              respostaGestorMotivo: motivo,
            }
          : r
      )
    );

    showToast(`Solicitação de troca ${status === 'aprovada' ? 'APROVADA' : 'REJEITADA'}.`);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    if (activeRole !== 'gestor') {
      showToast('Apenas o gestor pode cadastrar colaboradores.');
      return;
    }
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`Colaborador ${newUser.name} cadastrado com sucesso.`);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    if (activeRole !== 'gestor') {
      showToast('Apenas o gestor pode atualizar colaboradores.');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    showToast('Dados do colaborador atualizados.');
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setShifts(INITIAL_SHIFTS);
    setSwapRequests(INITIAL_SWAP_REQUESTS);
    setCurrentUserId('user_1');
    setIsGestorUnlocked(false);
    setGestorPin('1234');
    setSelectedDate(TODAY_ANCHOR);
    setActiveTab('minha_escala');
    showToast('Dados de demonstração restaurados.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        isGestorUnlocked,
        gestorPin,
        users,
        shifts,
        swapRequests,
        todayDate,
        selectedDate,
        activeTab,
        mobileMockupMode,
        notification,
        setActiveTab,
        setSelectedDate,
        setMobileMockupMode,
        switchUser,
        unlockGestorMode,
        lockGestorMode,
        changeGestorPin,
        addShift,
        updateShift,
        deleteShift,
        duplicateWeekShifts,
        acknowledgeShift,
        createSwapRequest,
        respondSwapRequest,
        addUser,
        updateUser,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
