
import React, { useState } from 'react';
import { Transaction, AccountType, TransactionStatus } from '../types';
import { TrendingUp, TrendingDown, Wallet, CalendarRange, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
  initialBalance: number;
  initialBalanceDate?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, initialBalance, initialBalanceDate }) => {
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };

  const getLastDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());

  // Filter for period summary
  const periodTransactions = transactions.filter(t => {
    const tDate = t.date;
    return tDate >= startDate && tDate <= endDate;
  });

  const totalIn = periodTransactions
    .filter(t => t.type === AccountType.INCOME && t.status === TransactionStatus.PAID)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOut = periodTransactions
    .filter(t => t.type === AccountType.EXPENSE && t.status === TransactionStatus.PAID)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingIn = periodTransactions
    .filter(t => t.type === AccountType.INCOME && t.status === TransactionStatus.PENDING)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingOut = periodTransactions
    .filter(t => t.type === AccountType.EXPENSE && t.status === TransactionStatus.PENDING)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Balance Calculation (Accumulated until End Date)
  const calculateCurrentBalance = () => {
    // 1. Transactions before the initial balance date are IGNORED if we strictly follow "Initial Balance Date".
    // However, if initialBalanceDate is not set, we assume initialBalance is from the beginning of time.

    // Simplification: We calculate balance = Initial + All Paid Txs <= endDate.
    // If initialBalanceDate is set, we only sum Txs >= initialBalanceDate.

    const balanceDate = initialBalanceDate || '1970-01-01';

    const historicalTransactions = transactions.filter(t =>
      t.status === TransactionStatus.PAID &&
      t.date <= endDate &&
      t.date >= balanceDate
    );

    const histIn = historicalTransactions
      .filter(t => t.type === AccountType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const histOut = historicalTransactions
      .filter(t => t.type === AccountType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return initialBalance + histIn - histOut;
  };

  const currentBalance = calculateCurrentBalance();

  // Chart data preparation
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      name: d.toLocaleString('pt-BR', { month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear()
    };
  });

  const chartData = last6Months.map(m => {
    const monthTx = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === m.month && txDate.getFullYear() === m.year && t.status === TransactionStatus.PAID;
    });

    const income = monthTx.filter(t => t.type === AccountType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
    const expense = monthTx.filter(t => t.type === AccountType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);

    return {
      name: m.name,
      Entradas: income,
      Saídas: expense,
      Saldo: income - expense
    };
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div class="space-y-8">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900">Resumo Financeiro</h1>
          <p class="text-slate-500">Acompanhe a saúde da sua empresa no período.</p>
        </div>

        <div class="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
            <span class="text-xs font-bold text-slate-600 uppercase">Período</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            class="text-sm font-semibold text-slate-700 bg-transparent border-none focus:ring-0 outline-none p-1"
          />
          <span class="text-slate-400 font-bold">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            class="text-sm font-semibold text-slate-700 bg-transparent border-none focus:ring-0 outline-none p-1"
          />
        </div>
      </header>

      {/* Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Entradas</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{formatCurrency(totalIn)}</p>
          <p class="text-xs text-emerald-600 font-medium mt-1">Realizado no período</p>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Saídas</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{formatCurrency(totalOut)}</p>
          <p class="text-xs text-rose-600 font-medium mt-1">Realizado no período</p>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <span class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Saldo Atual</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{formatCurrency(currentBalance)}</p>
          <p class="text-xs text-indigo-600 font-medium mt-1">Acumulado até o fim do período</p>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <CalendarRange className="w-6 h-6" />
            </div>
            <span class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Provisões</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{formatCurrency(pendingIn - pendingOut)}</p>
          <p class="text-xs text-orange-600 font-medium mt-1">Previsto para o período</p>
        </div>
      </div>

      {/* Charts */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Entradas vs Saídas (Realizado)</h3>
          <div class="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="Saídas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Fluxo de Caixa Acumulado</h3>
          <div class="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="Saldo" stroke="#6366f1" fillOpacity={1} fill="url(#colorSaldo)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
