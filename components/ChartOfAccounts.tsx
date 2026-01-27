

import React, { useState, useEffect } from 'react';
import { Account, AccountType, AppSettings, Transaction } from '../types';
import { Save, AlertTriangle, Building2, Trash2 } from 'lucide-react';

interface ChartOfAccountsProps {
  accounts: Account[];
  settings: AppSettings;
  transactions: Transaction[];
  onSave: (accounts: Account[], settings: AppSettings) => void;
}

const ChartOfAccounts: React.FC<ChartOfAccountsProps> = ({ accounts, settings, transactions, onSave }) => {
  const [localAccounts, setLocalAccounts] = useState<Account[]>(accounts);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalAccounts(accounts);
    setLocalSettings(settings);
  }, [accounts, settings]);

  const handleAccountChange = (id: string, newName: string) => {
    setLocalAccounts(prev => prev.map(a => a.id === id ? { ...a, name: newName } : a));
  };

  const handleAddAccount = (type: AccountType) => {
    const newAccount: Account = {
      id: `temp_${Date.now()}`,
      name: `Nova Conta ${type === AccountType.INCOME ? 'Receita' : 'Despesa'} ${localAccounts.filter(a => a.type === type).length + 1}`,
      type,
    };
    setLocalAccounts([...localAccounts, newAccount]);
  };

  const handleDeleteAccount = (accountId: string) => {
    // Verificar se a conta está sendo usada em alguma transação
    const isAccountUsed = transactions.some(t => t.accountId === accountId);

    if (isAccountUsed) {
      alert('Esta conta não pode ser deletada pois está sendo utilizada em lançamentos existentes.');
      return;
    }

    if (confirm('Tem certeza que deseja deletar esta conta? Esta ação não pode ser desfeita.')) {
      setLocalAccounts(prev => prev.filter(a => a.id !== accountId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localAccounts, localSettings);
    alert('Configurações salvas com sucesso!');
  };

  const incomeAccounts = localAccounts.filter(a => a.type === AccountType.INCOME);
  const expenseAccounts = localAccounts.filter(a => a.type === AccountType.EXPENSE);

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">Configurações Gerais</h1>
        <p class="text-slate-500">Defina os parâmetros da sua empresa e o plano de contas.</p>
      </div>

      <form onSubmit={handleSubmit} class="space-y-8">
        {/* Plano de Contas Description */}
        <section class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h2 class="text-xl font-bold text-slate-900">Plano de Contas</h2>
          </div>
          <div class="prose prose-slate max-w-none">
            <p class="text-slate-600 leading-relaxed">
              O Plano de Contas é a estrutura que organiza todas as receitas (entradas) e despesas (saídas) da empresa,
              servindo como base para o correto funcionamento do Fluxo de Caixa. Nesta aba, você poderá visualizar,
              cadastrar, editar ou complementar as contas que representam a realidade financeira do seu negócio,
              de acordo com o seu perfil operacional e suas necessidades específicas.
            </p>
            <p class="text-slate-600 leading-relaxed">
              Já existe uma estrutura inicial com categorias previamente definidas, porém o sistema permite que você
              adicione ou edite novas receitas e despesas sempre que necessário.
            </p>
          </div>
        </section>

        {/* Chart of Accounts */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incomes */}
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-emerald-600">Contas de Entrada</h3>
              <span class="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">RECEITAS</span>
            </div>
            <div class="space-y-3 flex-1">
              {incomeAccounts.map((acc, idx) => (
                <div key={acc.id} class="flex items-center gap-3">
                  <span class="text-slate-300 font-mono text-xs w-6">{String(idx + 1).padStart(2, '0')}</span>
                  <input
                    type="text"
                    value={acc.name}
                    placeholder="Nome da conta..."
                    onChange={(e) => handleAccountChange(acc.id, e.target.value)}
                    class="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(acc.id)}
                    class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Deletar conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddAccount(AccountType.INCOME)}
              class="mt-6 w-full py-2 border-2 border-dashed border-emerald-100 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all text-sm"
            >
              + Adicionar Nova Receita
            </button>
          </div>

          {/* Expenses */}
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-rose-600">Contas de Saída</h3>
              <span class="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-md">DESPESAS</span>
            </div>
            <div class="space-y-3 flex-1">
              {expenseAccounts.map((acc, idx) => (
                <div key={acc.id} class="flex items-center gap-3">
                  <span class="text-slate-300 font-mono text-xs w-6">{String(idx + 1).padStart(2, '0')}</span>
                  <input
                    type="text"
                    value={acc.name}
                    placeholder="Nome da conta..."
                    onChange={(e) => handleAccountChange(acc.id, e.target.value)}
                    class="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(acc.id)}
                    class="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="Deletar conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleAddAccount(AccountType.EXPENSE)}
              class="mt-6 w-full py-2 border-2 border-dashed border-rose-100 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all text-sm"
            >
              + Adicionar Nova Despesa
            </button>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
          <div>
            <h4 class="font-bold text-amber-800">Atenção Estrutural</h4>
            <p class="text-sm text-amber-700">As contas alimentam automaticamente os menus de seleção nos lançamentos. Evite deixar campos vazios ou duplicar nomes para manter a integridade dos relatórios.</p>
          </div>
        </div>

        <button
          type="submit"
          class="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          <Save className="w-6 h-6" />
          Salvar Todas as Configurações
        </button>
      </form>
    </div>
  );
};

export default ChartOfAccounts;
