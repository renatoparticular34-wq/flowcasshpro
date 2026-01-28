import { supabase } from '../lib/supabase';
import { Transaction, Account, AppSettings, TransactionStatus, AccountType } from '../types';

export const dataService = {
    // --- Transactions ---
    async getTransactions(): Promise<Transaction[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

        if (error) {
            console.error('Erro ao buscar transações:', error);
            return [];
        }

        return (data || []).map(t => ({
            id: t.id,
            date: t.date,
            accountId: t.account_id,
            description: t.description || '',
            amount: Number(t.amount),
            status: t.status as TransactionStatus,
            type: t.type as AccountType,
        }));
    },

    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                account_id: transaction.accountId,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                status: transaction.status,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar transação:', error);
            return null;
        }

        return {
            id: data.id,
            date: data.date,
            accountId: data.account_id,
            description: data.description || '',
            amount: Number(data.amount),
            status: data.status as TransactionStatus,
            type: data.type as AccountType,
        };
    },

    async updateTransaction(transaction: Transaction): Promise<boolean> {
        const { error } = await supabase
            .from('transactions')
            .update({
                account_id: transaction.accountId,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type,
                status: transaction.status,
            })
            .eq('id', transaction.id);

        if (error) {
            console.error('Erro ao atualizar transação:', error);
            return false;
        }
        return true;
    },

    async deleteTransaction(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar transação:', error);
            return false;
        }
        return true;
    },

    // --- Accounts ---
    async getAccounts(): Promise<Account[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (error) {
            console.error('Erro ao buscar contas:', error);
            return [];
        }

        return (data || []).map(a => ({
            id: a.id,
            name: a.name,
            type: a.type as AccountType,
        }));
    },

    async createAccount(name: string, type: AccountType): Promise<Account | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('accounts')
            .insert({ user_id: user.id, name, type })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar conta:', error);
            return null;
        }

        return { id: data.id, name: data.name, type: data.type as AccountType };
    },

    async updateAccount(account: Account): Promise<boolean> {
        const { error } = await supabase
            .from('accounts')
            .update({ name: account.name, type: account.type })
            .eq('id', account.id);

        if (error) {
            console.error('Erro ao atualizar conta:', error);
            return false;
        }
        return true;
    },

    async deleteAccount(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar conta:', error);
            return false;
        }
        return true;
    },

    // --- Settings ---
    async getSettings(): Promise<AppSettings> {
        const defaultSettings: AppSettings = {
            companyName: 'Minha Empresa',
            initialBalance: 0,
            email: '',
            phone: '',
            address: '',
            document: ''
        };

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return defaultSettings;

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error || !data) return defaultSettings;

        return {
            companyName: data.company_name || 'Minha Empresa',
            initialBalance: Number(data.initial_balance) || 0,
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            document: data.document || ''
        };
    },

    async updateSettings(settings: AppSettings): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('settings')
            .upsert({
                user_id: user.id,
                company_name: settings.companyName,
                initial_balance: settings.initialBalance,
                email: settings.email,
                phone: settings.phone,
                address: settings.address,
                document: settings.document,
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Erro ao atualizar configurações:', error);
            return false;
        }
        return true;
    }
};
