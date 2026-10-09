import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, X, KeyRound, Check, AlertCircle } from 'lucide-react';

interface PinAuthModalProps {
  onClose: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({ onClose }) => {
  const { unlockGestorMode, gestorPin } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 4) return;

    const success = unlockGestorMode(pin);
    if (success) {
      onClose();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Auto submit on 4th digit
        const success = unlockGestorMode(nextPin);
        if (success) {
          onClose();
        } else {
          setError(true);
          setPin('');
          setTimeout(() => setError(false), 2000);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Acesso Restrito do Gestor</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
            Insira o PIN de 4 dígitos para habilitar a criação e edição de escalas.
          </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-red-500 scale-110'
                    : isFilled
                    ? 'bg-blue-600 dark:bg-blue-400 scale-110 ring-4 ring-blue-100 dark:ring-blue-950'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 dark:text-red-400 mb-4 animate-shake font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>PIN incorreto. Tente novamente.</span>
          </div>
        )}

        {/* Mobile-Friendly Number Pad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-lg font-semibold transition-all text-slate-800 dark:text-slate-100 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 text-xs font-semibold text-slate-500 transition-all flex items-center justify-center"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 text-lg font-semibold transition-all text-slate-800 dark:text-slate-100 flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 text-xs font-semibold text-slate-500 transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Demo Hint Banner */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Dica de Demonstração: </span>
          O PIN padrão é <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-bold">{gestorPin}</code>
        </div>
      </div>
    </div>
  );
};
