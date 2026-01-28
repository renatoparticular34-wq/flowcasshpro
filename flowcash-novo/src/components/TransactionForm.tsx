import React, { useState } from 'react';
import { Transaction, Account, TransactionStatus, AccountType } from '../types';
import { X } from 'lucide-react';

interface TransactionFormProps {
  accounts: Account[];
  onSubmit: (data: Omit<Transaction, 'id' | 'type'>) => void;
  onClose: () => void;
  initialData?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    accountId: initialData?.accountId || '',
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    status: initialData?.status || TransactionStatus.PENDING,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || formData.amount <= 0) {
      alert('Preencha a conta e um valor válido.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-50 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white text-slate-400 hover:text-slate-600 rounded-full shadow-sm border border-slate-100 transition-all hover:rotate-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Data</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Conta</label>
            <select
              required
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Selecione uma conta...</option>
              <optgroup label="Entradas">
                {accounts.filter(a => a.type === AccountType.INCOME).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
              <optgroup label="Saídas">
                {accounts.filter(a => a.type === AccountType.EXPENSE).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição</label>
            <input
              type="text"
              placeholder="Descrição do lançamento"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Valor</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: TransactionStatus.PAID })}
                className={`py-2 px-3 rounded-xl border font-bold transition-all text-sm ${
                  formData.status === TransactionStatus.PAID
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                Realizado
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: TransactionStatus.PENDING })}
                className={`py-2 px-3 rounded-xl border font-bold transition-all text-sm ${
                  formData.status === TransactionStatus.PENDING
                    ? 'bg-orange-50 border-orange-500 text-orange-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                }`}
              >
                Pendente
              </button>
            </div>
          </div>
        </form>

        <div className="p-5 border-t border-slate-50 bg-slate-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors border border-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            {initialData ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;