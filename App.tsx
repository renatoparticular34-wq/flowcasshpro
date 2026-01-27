

import React, { useState, useEffect } from 'react';
import { Transaction, Account, AppSettings } from './types';
import { firebaseService } from './services/firebaseService';
import { AuthProvider, useAuth } from './components/AuthProvider';
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
  const [settings, setSettings] = useState<AppSettings>({
    companyName: '',
    initialBalance: 0,
    email: '',
    phone: '',
    address: '',
    document: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [dataLoading, setDataLoading] = useState(false);

  // Temporary initial balance state (cleared on logout)
  const [tempInitialBalance, setTempInitialBalance] = useState<number | undefined>(undefined);
  const [tempBalanceMonth, setTempBalanceMonth] = useState<number>(new Date().getMonth() + 1);
  const [tempBalanceYear, setTempBalanceYear] = useState<number>(new Date().getFullYear());

  const loadData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [txs, accs, sets] = await Promise.all([
        firebaseService.getTransactions(),
        firebaseService.getAccounts(),
        firebaseService.getSettings()
      ]);
      console.log('Dados carregados:', { txs: txs.length, accs: accs.length, sets });
      setTransactions(txs);
      setAccounts(accs);
      setSettings(sets);

      // Clear temporary balance when user logs in
      setTempInitialBalance(undefined);
      setTempBalanceMonth(new Date().getMonth() + 1);
      setTempBalanceYear(new Date().getFullYear());
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // Clear temporary balance when user logs out
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
    } as any;

    const created = await firebaseService.createTransaction(newTxData);
    if (created) {
      setTransactions([created, ...transactions]);
      setShowAddForm(false);
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

    const success = await firebaseService.updateTransaction(updatedTx);
    if (success) {
      setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
      setEditingTransaction(undefined);
      setShowAddForm(false);
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddForm(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      const success = await firebaseService.deleteTransaction(id);
      if (success) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    }
  };

  const handleUpdateAccounts = async (newAccounts: Account[], newSettings: AppSettings) => {
    await firebaseService.updateSettings(newSettings);

    // Process account updates
    for (const acc of newAccounts) {
      if (acc.id.startsWith('temp_')) {
        await firebaseService.createAccount(acc.name, acc.type);
      } else {
        const original = accounts.find(a => a.id === acc.id);
        if (original && original.name !== acc.name) {
          await firebaseService.updateAccount(acc);
        }
      }
    }

    setSettings(newSettings);
    loadData();
  };

  const handleUpdateProfile = async (newSettings: AppSettings) => {
    try {
      console.log('💾 Salvando perfil:', newSettings.companyName);
      const success = await firebaseService.updateSettings(newSettings);
      if (success) {
        console.log('✅ Perfil salvo com sucesso');

        // Atualiza o estado local primeiro
        setSettings(newSettings);

        // Mostra o alert de sucesso
        alert('Perfil atualizado com sucesso!');

        // Não recarrega imediatamente para evitar sobrescrever o estado local
      } else {
        console.error('❌ Erro ao salvar configurações');
        alert('Erro ao salvar as configurações. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      alert('Erro ao salvar as configurações. Verifique sua conexão e tente novamente.');
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
