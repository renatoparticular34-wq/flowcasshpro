
import { Transaction, Account, AppSettings, TransactionStatus, AccountType } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_SETTINGS, INITIAL_TRANSACTIONS } from './mockData';

const STORAGE_KEYS = {
    TRANSACTIONS: 'flowcash_transactions',
    ACCOUNTS: 'flowcash_accounts',
    SETTINGS: 'flowcash_settings'
};

const getId = () => Math.random().toString(36).substr(2, 9);

export const mockService = {
    // --- Transactions ---

    async getTransactions(): Promise<Transaction[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (stored) {
            return JSON.parse(stored);
        }
        return INITIAL_TRANSACTIONS;
    },

    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        const newTx: Transaction = {
            ...transaction,
            id: getId(),
            company_id: 'local-company'
        };

        const currentTxs = await this.getTransactions();
        const updatedTxs = [newTx, ...currentTxs];
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTxs));

        return newTx;
    },

    async deleteTransaction(id: string): Promise<boolean> {
        const currentTxs = await this.getTransactions();
        const updatedTxs = currentTxs.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTxs));
        return true;
    },

    async updateTransaction(transaction: Transaction): Promise<boolean> {
        const currentTxs = await this.getTransactions();
        const updatedTxs = currentTxs.map(t => t.id === transaction.id ? transaction : t);
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTxs));
        return true;
    },

    // --- Accounts ---

    async getAccounts(): Promise<Account[]> {
        const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize with default if empty
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
        return INITIAL_ACCOUNTS;
    },

    async createAccount(name: string, type: AccountType): Promise<Account | null> {
        const newAccount: Account = {
            id: getId(),
            name,
            type,
            company_id: 'local-company'
        };

        const currentAccs = await this.getAccounts();
        const updatedAccs = [...currentAccs, newAccount];
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccs));

        return newAccount;
    },

    async updateAccount(account: Account): Promise<boolean> {
        const currentAccs = await this.getAccounts();
        const updatedAccs = currentAccs.map(a => a.id === account.id ? account : a);
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccs));
        return true;
    },

    // --- Settings ---

    async getSettings(): Promise<AppSettings> {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (stored) {
            return JSON.parse(stored);
        }
        return INITIAL_SETTINGS;
    },

    async updateSettings(settings: AppSettings): Promise<boolean> {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    }
};
