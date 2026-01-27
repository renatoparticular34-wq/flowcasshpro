
import { Transaction, Account, AppSettings } from '../types';
import { DEFAULT_ACCOUNTS } from '../constants';

const KEYS = {
  TRANSACTIONS: 'flowcash_transactions',
  ACCOUNTS: 'flowcash_accounts',
  SETTINGS: 'flowcash_settings'
};

export const storageService = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (data: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data));
  },
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : DEFAULT_ACCOUNTS;
  },
  saveAccounts: (data: Account[]) => {
    localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(data));
  },
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { companyName: 'Minha Empresa Ltda', initialBalance: 0 };
  },
  saveSettings: (data: AppSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data));
  }
};
