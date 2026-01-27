import { supabase } from '../lib/supabase';
import { Transaction, Account, AppSettings, TransactionStatus, AccountType } from '../types';

export const supabaseService = {
    // --- Transactions ---

    async getTransactions(): Promise<Transaction[]> {
        console.log("📦 Buscando transações...");
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log("⚠️ Usuário não autenticado");
                return [];
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) {
                console.error("❌ Erro ao buscar transações:", error);
                return [];
            }

            console.log("✅ Transações encontradas:", data?.length || 0);
            return (data || []).map(t => ({
                id: t.id,
                date: t.date,
                accountId: t.account_id,
                description: t.description || '',
                amount: Number(t.amount),
                status: t.status as TransactionStatus,
                type: t.type as AccountType,
            }));
        } catch (error) {
            console.error("❌ Erro ao buscar transações:", error);
            return [];
        }
    },

    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        console.log("➕ Criando transação:", transaction);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("❌ Usuário não autenticado!");
                return null;
            }

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
                console.error("❌ Erro ao criar transação:", error);
                return null;
            }

            console.log("✅ Transação criada:", data.id);
            return {
                id: data.id,
                date: data.date,
                accountId: data.account_id,
                description: data.description || '',
                amount: Number(data.amount),
                status: data.status as TransactionStatus,
                type: data.type as AccountType,
            };
        } catch (error) {
            console.error("❌ Erro ao criar transação:", error);
            return null;
        }
    },

    async deleteTransaction(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("❌ Erro ao deletar transação:", error);
                return false;
            }
            return true;
        } catch (error) {
            console.error("❌ Erro ao deletar transação:", error);
            return false;
        }
    },

    async updateTransaction(transaction: Transaction): Promise<boolean> {
        try {
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
                console.error("❌ Erro ao atualizar transação:", error);
                return false;
            }
            return true;
        } catch (error) {
            console.error("❌ Erro ao atualizar transação:", error);
            return false;
        }
    },

    // --- Accounts ---

    async getAccounts(): Promise<Account[]> {
        console.log("📦 Buscando contas...");
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log("⚠️ Usuário não autenticado");
                return [];
            }

            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (error) {
                console.error("❌ Erro ao buscar contas:", error);
                return [];
            }

            console.log("✅ Contas encontradas:", data?.length || 0);
            return (data || []).map(a => ({
                id: a.id,
                name: a.name,
                type: a.type as AccountType,
            }));
        } catch (error) {
            console.error("❌ Erro ao buscar contas:", error);
            return [];
        }
    },

    async createAccount(name: string, type: AccountType): Promise<Account | null> {
        console.log("➕ Criando conta:", name, type);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("❌ Usuário não autenticado!");
                return null;
            }

            const { data, error } = await supabase
                .from('accounts')
                .insert({
                    user_id: user.id,
                    name,
                    type,
                })
                .select()
                .single();

            if (error) {
                console.error("❌ Erro ao criar conta:", error);
                return null;
            }

            console.log("✅ Conta criada:", data.id);
            return {
                id: data.id,
                name: data.name,
                type: data.type as AccountType,
            };
        } catch (error) {
            console.error("❌ Erro ao criar conta:", error);
            return null;
        }
    },

    async updateAccount(account: Account): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('accounts')
                .update({
                    name: account.name,
                    type: account.type,
                })
                .eq('id', account.id);

            if (error) {
                console.error("❌ Erro ao atualizar conta:", error);
                return false;
            }
            return true;
        } catch (error) {
            console.error("❌ Erro ao atualizar conta:", error);
            return false;
        }
    },

    async deleteAccount(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("❌ Erro ao deletar conta:", error);
                return false;
            }
            return true;
        } catch (error) {
            console.error("❌ Erro ao deletar conta:", error);
            return false;
        }
    },

    // --- Settings ---

    async getSettings(): Promise<AppSettings> {
        console.log("📦 Buscando configurações...");
        const defaultSettings: AppSettings = {
            companyName: 'Minha Empresa',
            initialBalance: 0,
            email: '',
            phone: '',
            address: '',
            document: ''
        };

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log("⚠️ Usuário não autenticado");
                return defaultSettings;
            }

            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error || !data) {
                console.log("ℹ️ Nenhuma config encontrada, retornando padrão");
                return defaultSettings;
            }

            console.log("✅ Configurações encontradas");
            return {
                companyName: data.company_name || 'Minha Empresa',
                initialBalance: Number(data.initial_balance) || 0,
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                document: data.document || ''
            };
        } catch (error) {
            console.error("❌ Erro ao buscar configurações:", error);
            return defaultSettings;
        }
    },

    async updateSettings(settings: AppSettings): Promise<boolean> {
        try {
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
                console.error("❌ Erro ao atualizar configurações:", error);
                return false;
            }
            return true;
        } catch (error) {
            console.error("❌ Erro ao atualizar configurações:", error);
            return false;
        }
    }
};
