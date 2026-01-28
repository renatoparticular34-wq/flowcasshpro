
import React, { useState } from 'react';
import { Transaction, Account, TransactionStatus, AccountType } from '../types';
import { Plus, Search, Filter, Trash2, Edit3, ArrowUpCircle, ArrowDownCircle, AlertCircle, AlertTriangle, Printer } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  tempInitialBalance?: number | undefined;
  tempBalanceMonth?: number;
  tempBalanceYear?: number;
  onTempBalanceChange?: (value: number | undefined) => void;
  onTempBalanceMonthChange?: (value: number) => void;
  onTempBalanceYearChange?: (value: number) => void;
}

// Função simples para formatar valor numérico para exibição (sem R$)
const formatCurrencyValue = (value: number): string => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  accounts,
  onAdd,
  onDelete,
  onEdit,
  tempInitialBalance = undefined,
  tempBalanceMonth = new Date().getMonth() + 1,
  tempBalanceYear = new Date().getFullYear(),
  onTempBalanceChange = () => { },
  onTempBalanceMonthChange = () => { },
  onTempBalanceYearChange = () => { }
}) => {
  // Função para lidar com mudanças no campo de moeda
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove qualquer caractere não numérico
    const numericValue = e.target.value.replace(/\D/g, '');

    // Converte para número (centavos) e depois divide por 100 para obter reais
    const cents = parseInt(numericValue) || 0;
    const realValue = cents / 100;

    // Atualiza o estado com o valor em reais
    onTempBalanceChange(realValue === 0 ? undefined : realValue);
  };
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | AccountType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TransactionStatus>('ALL');

  const filtered = transactions
    .filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
        accounts.find(a => a.id === t.accountId)?.name.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'ALL' || t.type === filterType;
      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'N/A';

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Movimentos</h1>
          <p className="text-slate-500">Gerencie suas entradas e saídas diárias.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all no-print"
            title="Imprimir"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 no-print"
          >
            <Plus className="w-5 h-5" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* Temporary Initial Balance Section */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-amber-800 mb-3">Saldo Inicial Temporário (Opcional)</h3>
            <p className="text-sm text-amber-700 mb-4">
              Configure um saldo inicial temporário para comparar com o fluxo de caixa.
              Este valor será zerado automaticamente ao encerrar a sessão.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">Valor do Saldo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold">R$</span>
                  <input
                    type="text"
                    value={tempInitialBalance ? formatCurrencyValue(tempInitialBalance) : ''}
                    onChange={handleCurrencyChange}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">Mês de Referência</label>
                <select
                  value={tempBalanceMonth}
                  onChange={(e) => onTempBalanceMonthChange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                >
                  {[
                    { value: 1, label: 'Janeiro' },
                    { value: 2, label: 'Fevereiro' },
                    { value: 3, label: 'Março' },
                    { value: 4, label: 'Abril' },
                    { value: 5, label: 'Maio' },
                    { value: 6, label: 'Junho' },
                    { value: 7, label: 'Julho' },
                    { value: 8, label: 'Agosto' },
                    { value: 9, label: 'Setembro' },
                    { value: 10, label: 'Outubro' },
                    { value: 11, label: 'Novembro' },
                    { value: 12, label: 'Dezembro' }
                  ].map(month => (
                    <option key={month.value} value={month.value}>{month.value} - {month.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">Ano de Referência</label>
                <select
                  value={tempBalanceYear}
                  onChange={(e) => onTempBalanceYearChange(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                >
                  {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            {(tempInitialBalance !== undefined && tempInitialBalance !== 0) && (
              <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Saldo configurado:</strong> R$ {formatCurrencyValue(tempInitialBalance)}
                  (referente a {new Date(tempBalanceYear, tempBalanceMonth - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por descrição ou conta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            <option value="ALL">Todos Tipos</option>
            <option value={AccountType.INCOME}>Entradas</option>
            <option value={AccountType.EXPENSE}>Saídas</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            <option value="ALL">Status</option>
            <option value={TransactionStatus.PAID}>Realizados</option>
            <option value={TransactionStatus.PENDING}>Provisões</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Conta</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className={`${t.status === TransactionStatus.PENDING ? 'bg-orange-50/50' : 'hover:bg-slate-50'} transition-colors group`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {t.type === AccountType.INCOME ?
                        <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> :
                        <ArrowDownCircle className="w-4 h-4 text-rose-500" />
                      }
                      <span className="text-sm font-semibold text-slate-900">{getAccountName(t.accountId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 italic max-w-xs truncate">
                    {t.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${t.status === TransactionStatus.PAID
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-orange-100 text-orange-700'
                      }`}>
                      {t.status === TransactionStatus.PAID ? 'Realizado' : 'Previsto'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${t.type === AccountType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                    {t.type === AccountType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(t)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Nenhum lançamento encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
};

export default Transactions;

