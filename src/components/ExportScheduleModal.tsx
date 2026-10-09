import React, { useState } from 'react';
import { Shift, User } from '../types';
import { formatDateBR, getDayOfWeekName } from '../utils/dateUtils';
import { X, Printer, Share2, Copy, Check, MessageSquare } from 'lucide-react';

interface ExportScheduleModalProps {
  user: User;
  shifts: Shift[];
  referenceDate: string;
  onClose: () => void;
}

export const ExportScheduleModal: React.FC<ExportScheduleModalProps> = ({
  user,
  shifts,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Sort shifts
  const sortedShifts = [...shifts].sort((a, b) => a.date.localeCompare(b.date));

  // Generate WhatsApp formatted text
  const generateWhatsAppText = (): string => {
    let text = `🚍 *ESCALA DE TRABALHO - TRÁFEGO*\n`;
    text += `👤 *Colaborador:* ${user.name} (${user.matricula})\n`;
    text += `📋 *Cargo:* ${user.cargo}\n`;
    text += `------------------------------------\n`;

    if (sortedShifts.length === 0) {
      text += `Nenhuma escala programada para o período.\n`;
    } else {
      sortedShifts.forEach((s) => {
        const diaSemana = getDayOfWeekName(s.date, 'long');
        const data = formatDateBR(s.date);
        if (s.type === 'folga') {
          text += `📅 *${data} (${diaSemana})*: 🟢 *FOLGA / DSR*\n\n`;
        } else if (s.type === 'plantao') {
          text += `📅 *${data} (${diaSemana})*: 🟡 *PLANTÃO* (${s.startTime} às ${s.endTime})\n`;
          text += `   📍 Local: ${s.pontoApresentacao}\n\n`;
        } else {
          text += `📅 *${data} (${diaSemana})*: 🔵 *TRABALHO*\n`;
          text += `   ⏰ Horário: ${s.startTime} às ${s.endTime}\n`;
          text += `   🚍 Linha: ${s.linha}\n`;
          if (s.veiculoPrefixo) text += `   🚐 Veículo: ${s.veiculoPrefixo}\n`;
          text += `   📍 Apresentação: ${s.pontoApresentacao}\n`;
          if (s.observacoes) text += `   ℹ️ Obs: ${s.observacoes}\n`;
          text += `\n`;
        }
      });
    }

    text += `------------------------------------\n`;
    text += `⚠️ *Atenção:* Favor confirmar ciência no aplicativo.\n`;
    text += `Supervisor de Tráfego: Fretamento MaxTour`;
    return text;
  };

  const handleCopyText = async () => {
    const text = generateWhatsAppText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Exportar & Compartilhar Escala</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.name} · {user.matricula}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 my-4 shrink-0">
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>

        {/* Printable/Preview content area */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-3 leading-relaxed whitespace-pre-wrap select-text">
          {generateWhatsAppText()}
        </div>

        <div className="pt-3 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
