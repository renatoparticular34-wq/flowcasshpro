
import React, { useState, useMemo } from 'react';
import { Transaction, Account, AppSettings, TransactionStatus, AccountType } from '../types';
import { ChevronLeft, ChevronRight, FileDown, Printer } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
  accounts: Account[];
  settings: AppSettings;
  tempInitialBalance?: number | undefined;
  tempBalanceMonth?: number;
  tempBalanceYear?: number;
}

const Reports: React.FC<ReportsProps> = ({
  transactions,
  accounts,
  settings,
  tempInitialBalance = undefined,
  tempBalanceMonth = new Date().getMonth() + 1,
  tempBalanceYear = new Date().getFullYear()
}) => {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewStatus, setViewStatus] = useState<'ALL' | TransactionStatus>('ALL');

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const consolidation = useMemo(() => {
    // 1. Calculate balance BEFORE the current viewYear
    const preYearTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() < viewYear && t.status === TransactionStatus.PAID;
    });

    const preIn = preYearTransactions.filter(t => t.type === AccountType.INCOME).reduce((a, b) => a + b.amount, 0);
    const preOut = preYearTransactions.filter(t => t.type === AccountType.EXPENSE).reduce((a, b) => a + b.amount, 0);

    // Check if temporary balance should be applied to this year
    const shouldApplyTempBalance = tempInitialBalance !== undefined && tempInitialBalance !== 0 && tempBalanceYear === viewYear && tempBalanceMonth <= 12;

    // Balance at start of Jan 1st of viewYear
    let runningBalance = settings.initialBalance + (preIn - preOut);

    const monthlyData: any[] = [];

    for (let m = 0; m < 12; m++) {
      // Apply temporary balance at the beginning of the specified month
      if (shouldApplyTempBalance && m === tempBalanceMonth - 1) {
        runningBalance += tempInitialBalance;
      }

      const currentOpening = runningBalance;

      const monthTx = transactions.filter(t => {
        const d = new Date(t.date);
        const matchTime = d.getMonth() === m && d.getFullYear() === viewYear;
        const matchStatus = viewStatus === 'ALL' || t.status === viewStatus;
        return matchTime && matchStatus;
      });

      const totalIn = monthTx.filter(t => t.type === AccountType.INCOME).reduce((a, b) => a + b.amount, 0);
      const totalOut = monthTx.filter(t => t.type === AccountType.EXPENSE).reduce((a, b) => a + b.amount, 0);

      const monthlyNet = totalIn - totalOut;
      const closingBalance = currentOpening + monthlyNet;

      const breakdown: Record<string, number> = {};
      accounts.forEach(acc => {
        breakdown[acc.id] = monthTx.filter(t => t.accountId === acc.id).reduce((a, b) => a + b.amount, 0);
      });

      monthlyData.push({
        opening: currentOpening,
        totalIn,
        totalOut,
        net: monthlyNet,
        closing: closingBalance,
        breakdown
      });

      runningBalance = closingBalance;
    }

    return monthlyData;
  }, [transactions, accounts, settings, viewYear, viewStatus, tempInitialBalance, tempBalanceMonth, tempBalanceYear]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Fluxo de Caixa (FDC)</h1>
          <p className="text-slate-500">Consolidado mensal estruturado para 12 meses.</p>
        </div>

        <div className="flex gap-4 no-print sm:flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
            title="Imprimir"
          >
            <Printer className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <button onClick={() => setViewYear(y => y - 1)} className="p-1 hover:bg-slate-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-900 px-2">{viewYear}</span>
            <button onClick={() => setViewYear(y => y + 1)} className="p-1 hover:bg-slate-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <select
            value={viewStatus}
            onChange={(e) => setViewStatus(e.target.value as any)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
          >
            <option value="ALL">Todos os Lançamentos</option>
            <option value={TransactionStatus.PAID}>Somente Realizados</option>
            <option value={TransactionStatus.PENDING}>Somente Previsões</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-medium border-collapse">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-3 text-left border border-slate-800 min-w-[200px]">Descrição / Mês</th>
                {months.map(m => (
                  <th key={m} className="p-3 text-center border border-slate-800 min-w-[100px]">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Balances */}
              <tr className="bg-indigo-50/50">
                <td className="p-3 font-bold text-slate-900 border border-slate-100">Saldo Inicial</td>
                {consolidation.map((data, i) => (
                  <td key={i} className="p-3 text-right font-bold text-slate-900 border border-slate-100">
                    {formatCurrency(data.opening)}
                  </td>
                ))}
              </tr>

              {/* Incomes */}
              <tr className="bg-emerald-50 text-emerald-800 uppercase text-[9px] tracking-widest font-bold">
                <td colSpan={13} className="p-2 px-4 border border-slate-100">Receitas</td>
              </tr>
              {accounts.filter(a => a.type === AccountType.INCOME).map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50">
                  <td className="p-3 pl-6 border border-slate-100 text-slate-600 font-medium">{acc.name}</td>
                  {consolidation.map((data, i) => (
                    <td key={i} className="p-3 text-right border border-slate-100 text-emerald-600">
                      {data.breakdown[acc.id] > 0 ? formatCurrency(data.breakdown[acc.id]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-emerald-100/50 font-bold">
                <td className="p-3 border border-slate-100 text-emerald-800">Total de Entradas</td>
                {consolidation.map((data, i) => (
                  <td key={i} className="p-3 text-right border border-slate-100 text-emerald-800">
                    {formatCurrency(data.totalIn)}
                  </td>
                ))}
              </tr>

              {/* Expenses */}
              <tr className="bg-rose-50 text-rose-800 uppercase text-[9px] tracking-widest font-bold">
                <td colSpan={13} className="p-2 px-4 border border-slate-100">Despesas</td>
              </tr>
              {accounts.filter(a => a.type === AccountType.EXPENSE).map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50">
                  <td className="p-3 pl-6 border border-slate-100 text-slate-600 font-medium">{acc.name}</td>
                  {consolidation.map((data, i) => (
                    <td key={i} className="p-3 text-right border border-slate-100 text-rose-600">
                      {data.breakdown[acc.id] > 0 ? formatCurrency(data.breakdown[acc.id]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-rose-100/50 font-bold">
                <td className="p-3 border border-slate-100 text-rose-800">Total de Saídas</td>
                {consolidation.map((data, i) => (
                  <td key={i} className="p-3 text-right border border-slate-100 text-rose-800">
                    {formatCurrency(data.totalOut)}
                  </td>
                ))}
              </tr>

              {/* Bottom Line */}
              <tr className="bg-slate-50 font-extrabold border-t-2 border-slate-200">
                <td className="p-3 border border-slate-100 text-slate-900">Resultado Mensal</td>
                {consolidation.map((data, i) => (
                  <td key={i} className={`p-3 text-right border border-slate-100 ${data.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatCurrency(data.net)}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-900 text-white font-extrabold">
                <td className="p-4 border border-slate-800 text-sm">Saldo Acumulado</td>
                {consolidation.map((data, i) => (
                  <td key={i} className="p-4 text-right border border-slate-800 text-sm">
                    {formatCurrency(data.closing)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

