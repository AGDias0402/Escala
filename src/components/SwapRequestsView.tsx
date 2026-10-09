import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateBR } from '../utils/dateUtils';
import { 
  ArrowRightLeft, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User as UserIcon, 
  Calendar,
  AlertCircle,
  MessageSquare,
  Lock
} from 'lucide-react';
import { SwapRequestModal } from './SwapRequestModal';
import { PinAuthModal } from './PinAuthModal';

export const SwapRequestsView: React.FC = () => {
  const { 
    swapRequests, 
    activeRole, 
    currentUser, 
    respondSwapRequest 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  const handleApprove = (id: string) => {
    respondSwapRequest(id, 'aprovada');
  };

  const handleConfirmReject = (id: string) => {
    respondSwapRequest(id, 'rejeitada', rejectReason.trim() || 'Incompatibilidade operacional');
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Permutas & Trocas de Escala
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {swapRequests.length} solicitações
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Solicitações entre colaboradores com moderação do gestor
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Solicitar Permuta</span>
          </button>
        </div>
      </div>

      {/* Role explanation */}
      {activeRole !== 'gestor' && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>Você está no modo Colaborador. Apenas o Gestor pode aprovar ou rejeitar trocas.</span>
          <button
            onClick={() => setShowPinModal(true)}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            <Lock className="w-3 h-3" />
            <span>Acesso Gestor</span>
          </button>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {swapRequests.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Nenhuma solicitação de troca registrada.
          </div>
        ) : (
          swapRequests.map((req) => {
            const isPending = req.status === 'pendente';
            const isApproved = req.status === 'aprovada';
            const isRejected = req.status === 'rejeitada';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Solicitado em {new Date(req.dataSolicitacao).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isPending
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : isApproved
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                {/* Parties Involved */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    
                    {/* Solicitante */}
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Colaborador Solicitante
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {req.solicitanteNome}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">
                        Data: {formatDateBR(req.dataEscalaOrigem)} · {req.linhaOrigem}
                      </span>
                    </div>

                    {/* Colega */}
                    <div className="sm:border-l sm:border-slate-200 dark:sm:border-slate-750 sm:pl-3">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Permuta com Colega
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {req.colegaNome}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">
                        Data: {formatDateBR(req.dataEscalaDestino)}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Reason */}
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-200">Motivo informado: </strong>
                  {req.motivo}
                </div>

                {/* Manager response if any */}
                {req.respostaGestorMotivo && (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <strong className="block text-[10px] uppercase text-slate-500 mb-0.5">
                      Parecer do Gestor:
                    </strong>
                    {req.respostaGestorMotivo}
                  </div>
                )}

                {/* Manager Action Buttons (Only Gestor can approve/reject) */}
                {isPending && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                    {activeRole === 'gestor' ? (
                      rejectingId === req.id ? (
                        <div className="w-full space-y-2">
                          <input
                            type="text"
                            placeholder="Motivo da recusa (ex: falta de cobertura na linha)..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setRejectingId(null)}
                              className="px-3 py-1.5 text-xs text-slate-500 hover:underline"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleConfirmReject(req.id)}
                              className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-xl font-semibold"
                            >
                              Confirmar Recusa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setRejectingId(req.id)}
                            className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Recusar</span>
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aprovar & Efetivar Permuta</span>
                          </button>
                        </>
                      )
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Aguardando análise e aprovação do Gestor</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal to request swap */}
      {isModalOpen && (
        <SwapRequestModal onClose={() => setIsModalOpen(false)} />
      )}

      {/* PIN Auth Modal */}
      {showPinModal && (
        <PinAuthModal onClose={() => setShowPinModal(false)} />
      )}

    </div>
  );
};
