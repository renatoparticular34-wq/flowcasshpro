import React, { useState, useEffect } from 'react';
import { Transaction, Account, AppSettings } from './types';
import { dataService } from './lib/dataService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { INITIAL_ACCOUNTS, INITIAL_SETTINGS } from './services/mockData';

import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import ChartOfAccounts from './components/ChartOfAccounts';
import Reports from './components/Reports';
import Profile from './components/Profile';
import TransactionForm from './components/TransactionForm';
import Login from './components/Login';
import { Loader2 } from 'lucide-react';

const FlowCashApp: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadingError, setLoadingError] = useState('');

  // Temporary initial balance state (cleared on logout)
  const [tempInitialBalance, setTempInitialBalance] = useState<number | undefined>(undefined);
  const [tempBalanceMonth, setTempBalanceMonth] = useState<number>(new Date().getMonth() + 1);
  const [tempBalanceYear, setTempBalanceYear] = useState<number>(new Date().getFullYear());

  const loadData = async () => {
    if (!user) return;
    setDataLoading(true);
    setLoadingError('');

    try {
      console.log('🔄 Iniciando carregamento de dados...');

      // Buscar dados
      const [txs, accs, sets] = await Promise.all([
        dataService.getTransactions(),
        dataService.getAccounts(),
        dataService.getSettings()
      ]);

      console.log('✅ Dados carregados:', { txs: txs.length, accs: accs.length, sets });

      // Se não houver contas, criar contas padrão
      let finalAccounts = accs;
      if (accs.length === 0) {
        console.log('🌱 Nenhuma conta encontrada, criando contas padrão...');
        const createdAccounts: Account[] = [];

        for (const acc of INITIAL_ACCOUNTS) {
          try {
            const result = await dataService.createAccount(acc.name, acc.type);
            if (result) {
              createdAccounts.push(result);
            }
          } catch (e) {
            console.error('❌ Erro ao criar conta:', acc.name, e);
          }
        }

        if (createdAccounts.length > 0) {
          finalAccounts = createdAccounts;
          console.log('✅ Contas criadas:', createdAccounts.length);
        } else {
          // Fallback apenas visual
          finalAccounts = INITIAL_ACCOUNTS;
        }
      }

      setTransactions(txs);
      setAccounts(finalAccounts);
      // Se as settings do servidor estiverem vazias (default), usa as iniciais
      setSettings(sets.email ? sets : { ...sets, ...INITIAL_SETTINGS });

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoadingError(error.message || 'Erro desconhecido');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setTempInitialBalance(undefined);
      setTempBalanceMonth(new Date().getMonth() + 1);
      setTempBalanceYear(new Date().getFullYear());
    }
  }, [user]);

  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'type'>) => {
    const account = accounts.find(a => a.id === data.accountId);
    if (!account) return;

    const newTxData = {
      ...data,
      type: account.type
    };

    const created = await dataService.createTransaction(newTxData);
    if (created) {
      setTransactions([created, ...transactions]);
      setShowAddForm(false);
    } else {
      alert('Erro ao criar transação. Tente novamente.');
    }
  };

  const handleEditTransaction = async (data: Omit<Transaction, 'id' | 'type'>) => {
    if (!editingTransaction) return;

    const account = accounts.find(a => a.id === data.accountId);
    if (!account) return;

    const updatedTx = {
      ...editingTransaction,
      ...data,
      type: account.type
    };

    const success = await dataService.updateTransaction(updatedTx);
    if (success) {
      setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
      setEditingTransaction(undefined);
      setShowAddForm(false);
    } else {
      alert('Erro ao atualizar transação. Tente novamente.');
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddForm(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      const success = await dataService.deleteTransaction(id);
      if (success) {
        setTransactions(transactions.filter(t => t.id !== id));
      } else {
        alert('Erro ao excluir transação.');
      }
    }
  };

  const handleUpdateAccounts = async (newAccounts: Account[], newSettings: AppSettings) => {
    await dataService.updateSettings(newSettings);

    const newIds = new Set(newAccounts.map(a => a.id));
    const toDelete = accounts.filter(a => !newIds.has(a.id) && !a.id.startsWith('temp_'));

    for (const acc of toDelete) {
      await dataService.deleteAccount(acc.id);
    }

    for (const acc of newAccounts) {
      if (acc.id.startsWith('temp_')) {
        await dataService.createAccount(acc.name, acc.type);
      } else {
        const original = accounts.find(a => a.id === acc.id);
        if (original && original.name !== acc.name) {
          await dataService.updateAccount(acc);
        }
      }
    }

    setSettings(newSettings);
    loadData();
  };

  const handleUpdateProfile = async (newSettings: AppSettings) => {
    const success = await dataService.updateSettings(newSettings);
    if (success) {
      setSettings(newSettings);
      alert('Perfil atualizado com sucesso!');
    } else {
      alert('Erro ao salvar as configurações.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => { }} />;
  }

  if (dataLoading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">Carregando seus dados...</p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full border border-rose-900/50 text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
          <p className="text-rose-200/80 mb-6 text-sm">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} companyName={settings.companyName}>
      <div className="flex justify-end mb-4 -mt-4">
        <button
          onClick={signOut}
          className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
        >
          Encerrar Sessão
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <Dashboard
          transactions={transactions}
          initialBalance={settings.initialBalance}
          initialBalanceDate={settings.initialBalanceDate}
        />
      )}

      {activeTab === 'transactions' && (
        <Transactions
          transactions={transactions}
          accounts={accounts}
          onAdd={() => { setEditingTransaction(undefined); setShowAddForm(true); }}
          onDelete={handleDeleteTransaction}
          onEdit={openEditModal}
          tempInitialBalance={tempInitialBalance}
          tempBalanceMonth={tempBalanceMonth}
          tempBalanceYear={tempBalanceYear}
          onTempBalanceChange={setTempInitialBalance}
          onTempBalanceMonthChange={setTempBalanceMonth}
          onTempBalanceYearChange={setTempBalanceYear}
        />
      )}

      {activeTab === 'accounts' && (
        <ChartOfAccounts
          accounts={accounts}
          settings={settings}
          transactions={transactions}
          onSave={handleUpdateAccounts}
        />
      )}

      {activeTab === 'reports' && (
        <Reports
          transactions={transactions}
          accounts={accounts}
          settings={settings}
          tempInitialBalance={tempInitialBalance}
          tempBalanceMonth={tempBalanceMonth}
          tempBalanceYear={tempBalanceYear}
        />
      )}

      {activeTab === 'profile' && (
        <Profile
          settings={settings}
          onSave={handleUpdateProfile}
        />
      )}

      {showAddForm && (
        <TransactionForm
          accounts={accounts}
          onClose={() => { setShowAddForm(false); setEditingTransaction(undefined); }}
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          initialData={editingTransaction}
        />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FlowCashApp />
    </AuthProvider>
  );
};

export default App;
