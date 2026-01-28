import { supabase } from '../lib/supabase';
import { Transaction, Account, AppSettings, TransactionStatus, AccountType } from '../types';

// Helper function to get the current user's company_id
async function getCompanyId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        console.error('Erro ao buscar company_id:', error);
        return null;
    }

    return profile.company_id;
}

export const dataService = {
    // --- Transactions ---
    async getTransactions(): Promise<Transaction[]> {
        const companyId = await getCompanyId();
        if (!companyId) return [];

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('company_id', companyId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Erro ao buscar transações:', error);
            return [];
        }

        return (data || []).map(t => ({
            id: t.id,
            date: t.date,
            accountId: t.account_id || '',
            description: t.description || '',
            amount: Number(t.amount),
            status: t.status === 'SIM' ? TransactionStatus.PAID : TransactionStatus.PENDING,
            type: t.type === 'Entrada' ? AccountType.INCOME : AccountType.EXPENSE,
        }));
    },

    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        const companyId = await getCompanyId();
        if (!companyId) return null;

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                company_id: companyId,
                account_id: transaction.accountId || null,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type === AccountType.INCOME ? 'Entrada' : 'Saída',
                status: transaction.status === TransactionStatus.PAID ? 'SIM' : 'NÃO',
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
            accountId: data.account_id || '',
            description: data.description || '',
            amount: Number(data.amount),
            status: data.status === 'SIM' ? TransactionStatus.PAID : TransactionStatus.PENDING,
            type: data.type === 'Entrada' ? AccountType.INCOME : AccountType.EXPENSE,
        };
    },

    async updateTransaction(transaction: Transaction): Promise<boolean> {
        const { error } = await supabase
            .from('transactions')
            .update({
                account_id: transaction.accountId || null,
                date: transaction.date,
                description: transaction.description,
                amount: transaction.amount,
                type: transaction.type === AccountType.INCOME ? 'Entrada' : 'Saída',
                status: transaction.status === TransactionStatus.PAID ? 'SIM' : 'NÃO',
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

    // --- Accounts (accounts_plan table) ---
    async getAccounts(): Promise<Account[]> {
        const companyId = await getCompanyId();
        if (!companyId) return [];

        const { data, error } = await supabase
            .from('accounts_plan')
            .select('*')
            .eq('company_id', companyId)
            .order('name');

        if (error) {
            console.error('Erro ao buscar contas:', error);
            return [];
        }

        return (data || []).map(a => ({
            id: a.id,
            name: a.name,
            type: a.type === 'Entrada' ? AccountType.INCOME : AccountType.EXPENSE,
        }));
    },

    async createAccount(name: string, type: AccountType): Promise<Account | null> {
        const companyId = await getCompanyId();
        if (!companyId) return null;

        const { data, error } = await supabase
            .from('accounts_plan')
            .insert({
                company_id: companyId,
                name,
                type: type === AccountType.INCOME ? 'Entrada' : 'Saída'
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar conta:', error);
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            type: data.type === 'Entrada' ? AccountType.INCOME : AccountType.EXPENSE
        };
    },

    async updateAccount(account: Account): Promise<boolean> {
        const { error } = await supabase
            .from('accounts_plan')
            .update({
                name: account.name,
                type: account.type === AccountType.INCOME ? 'Entrada' : 'Saída'
            })
            .eq('id', account.id);

        if (error) {
            console.error('Erro ao atualizar conta:', error);
            return false;
        }
        return true;
    },

    async deleteAccount(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('accounts_plan')
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

        const companyId = await getCompanyId();
        if (!companyId) return defaultSettings;

        // Get company name
        const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', companyId)
            .single();

        // Get settings
        const { data: settings } = await supabase
            .from('settings')
            .select('*')
            .eq('company_id', companyId)
            .single();

        return {
            companyName: company?.name || 'Minha Empresa',
            initialBalance: Number(settings?.initial_balance) || 0,
            email: '',
            phone: '',
            address: '',
            document: ''
        };
    },

    async updateSettings(settings: AppSettings): Promise<boolean> {
        const companyId = await getCompanyId();
        if (!companyId) return false;

        // Update company name
        const { error: companyError } = await supabase
            .from('companies')
            .update({ name: settings.companyName })
            .eq('id', companyId);

        if (companyError) {
            console.error('Erro ao atualizar empresa:', companyError);
            return false;
        }

        // Update settings (initial_balance)
        const { error: settingsError } = await supabase
            .from('settings')
            .update({ initial_balance: settings.initialBalance })
            .eq('company_id', companyId);

        if (settingsError) {
            console.error('Erro ao atualizar configurações:', settingsError);
            return false;
        }

        return true;
    }
};
