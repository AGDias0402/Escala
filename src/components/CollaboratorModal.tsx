import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { X, User as UserIcon, Phone, Mail, Award, Check } from 'lucide-react';

interface CollaboratorModalProps {
  collaboratorToEdit?: User | null;
  onClose: () => void;
}

export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  collaboratorToEdit,
  onClose,
}) => {
  const { addUser, updateUser } = useApp();

  const [name, setName] = useState(collaboratorToEdit ? collaboratorToEdit.name : '');
  const [matricula, setMatricula] = useState(collaboratorToEdit ? collaboratorToEdit.matricula : '');
  const [cargo, setCargo] = useState(collaboratorToEdit ? collaboratorToEdit.cargo : 'Motorista de Fretamento');
  const [departamento, setDepartamento] = useState(collaboratorToEdit ? collaboratorToEdit.departamento : 'Fretamento Contínuo');
  const [telefone, setTelefone] = useState(collaboratorToEdit ? collaboratorToEdit.telefone : '');
  const [email, setEmail] = useState(collaboratorToEdit ? collaboratorToEdit.email : '');
  const [cnh, setCnh] = useState(collaboratorToEdit ? collaboratorToEdit.cnh || '' : '');
  const [validadeCnh, setValidadeCnh] = useState(collaboratorToEdit ? collaboratorToEdit.validadeCnh || '' : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !matricula.trim()) return;

    if (collaboratorToEdit) {
      updateUser(collaboratorToEdit.id, {
        name: name.trim(),
        matricula: matricula.trim(),
        cargo: cargo.trim(),
        departamento: departamento.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        cnh: cnh.trim() || undefined,
        validadeCnh: validadeCnh.trim() || undefined,
      });
    } else {
      addUser({
        name: name.trim(),
        matricula: matricula.trim(),
        cargo: cargo.trim(),
        departamento: departamento.trim(),
        telefone: telefone.trim() || '(11) 90000-0000',
        email: email.trim() || `${matricula.toLowerCase()}@maxtour.com.br`,
        role: 'colaborador',
        cnh: cnh.trim() || undefined,
        validadeCnh: validadeCnh.trim() || undefined,
        ativo: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {collaboratorToEdit ? 'Editar Colaborador' : 'Novo Colaborador / Motorista'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cadastro de equipe operacional
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Carlos da Silva"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Matrícula *
              </label>
              <input
                type="text"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ex: MT-1050"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cargo Operacional
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Motorista de Fretamento">Motorista de Fretamento</option>
                <option value="Motorista Rodoviário">Motorista Rodoviário</option>
                <option value="Motorista Executivo">Motorista Executivo</option>
                <option value="Motorista Reserva">Motorista Reserva</option>
                <option value="Fiscal de Tráfego">Fiscal de Tráfego</option>
                <option value="Manobrista">Manobrista</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Departamento
              </label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Fretamento Contínuo">Fretamento Contínuo</option>
                <option value="Fretamento Executivo">Fretamento Executivo</option>
                <option value="Operações Urbanas">Operações Urbanas</option>
                <option value="Reserva Operacional">Reserva Operacional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CNH / Categoria
              </label>
              <input
                type="text"
                value={cnh}
                onChange={(e) => setCnh(e.target.value)}
                placeholder="Ex: 019283746 - Cat. D"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Validade CNH
              </label>
              <input
                type="text"
                value={validadeCnh}
                onChange={(e) => setValidadeCnh(e.target.value)}
                placeholder="DD/MM/AAAA"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
            >
              {collaboratorToEdit ? 'Salvar Dados' : 'Cadastrar'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
