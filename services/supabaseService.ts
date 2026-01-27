
import { supabase } from '../lib/supabase';
import { Transaction, Account, AppSettings, DBTransaction, DBAccount, TransactionStatus, AccountType } from '../types';

export const supabaseService = {
    // --- Transactions ---

    async getTransactions(): Promise<Transaction[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }

        return (data as DBTransaction[]).map(tx => ({
            id: tx.id,
            date: tx.date,
            accountId: tx.account_id || '',
            description: tx.description,
            amount: Number(tx.amount),
            status: tx.status as TransactionStatus,
            type: tx.type as AccountType,
            company_id: tx.company_id
        }));
    },

    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        if (!supabase) return null;

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not authenticated');

        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .single();

        if (!profile) throw new Error('Profile not found');

        const payload = {
            company_id: profile.company_id,
            account_id: transaction.accountId,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            status: transaction.status,
            type: transaction.type
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            return null;
        }

        const tx = data as DBTransaction;
        return {
            id: tx.id,
            date: tx.date,
            accountId: tx.account_id || '',
            description: tx.description,
            amount: Number(tx.amount),
            status: tx.status as TransactionStatus,
            type: tx.type as AccountType,
            company_id: tx.company_id
        };
    },

    async deleteTransaction(id: string): Promise<boolean> {
        if (!supabase) return false;

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction:', error);
            return false;
        }
        return true;
    },

    async updateTransaction(transaction: Transaction): Promise<boolean> {
        if (!supabase) return false;

        const payload = {
            account_id: transaction.accountId,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            status: transaction.status,
            type: transaction.type
        };

        const { error } = await supabase
            .from('transactions')
            .update(payload)
            .eq('id', transaction.id);

        if (error) {
            console.error('Error updating transaction:', error);
            return false;
        }
        return true;
    },

    // --- Accounts ---

    async getAccounts(): Promise<Account[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('accounts_plan')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching accounts:', error);
            return [];
        }

        return (data as DBAccount[]).map(acc => ({
            id: acc.id,
            name: acc.name,
            type: acc.type as AccountType,
            company_id: acc.company_id
        }));
    },

    async createAccount(name: string, type: AccountType): Promise<Account | null> {
        if (!supabase) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .single();

        if (!profile) throw new Error('Profile not found');

        const { data, error } = await supabase
            .from('accounts_plan')
            .insert([{
                company_id: profile.company_id,
                name,
                type
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating account:', error);
            return null;
        }

        const acc = data as DBAccount;
        return {
            id: acc.id,
            name: acc.name,
            type: acc.type as AccountType,
            company_id: acc.company_id
        };
    },

    async updateAccount(account: Account): Promise<boolean> {
        if (!supabase) return false;

        const { error } = await supabase
            .from('accounts_plan')
            .update({ name: account.name, type: account.type })
            .eq('id', account.id);

        if (error) {
            console.error('Error updating account:', error);
            return false;
        }
        return true;
    },

    // --- Settings ---

    async getSettings(): Promise<AppSettings> {
        if (!supabase) return {
            companyName: '',
            initialBalance: 0,
            email: '',
            phone: '',
            address: '',
            document: ''
        };

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('company:companies(name)')
                .single();

            if (profileError) {
                console.error('❌ Erro ao buscar profile:', profileError);
            }

            // Fetch settings from settings table
            const { data: settingsData, error: settingsError } = await supabase
                .from('settings')
                .select('*')
                .single();

            if (settingsError && settingsError.code !== 'PGRST116') {
                console.error('❌ Erro ao buscar settings:', settingsError);
            }

            const result = {
                companyName: (profile?.company as any)?.name || 'Sistema FlowCash Pro',
                initialBalance: Number(settingsData?.initial_balance || 0),
                initialBalanceDate: settingsData?.initial_balance_date || '',
                email: settingsData?.email || '',
                phone: settingsData?.phone || '',
                address: settingsData?.address || '',
                document: settingsData?.document || ''
            };

            console.log('📋 Perfil carregado:', result.companyName);
            return result;
        } catch (error) {
            console.error('Erro geral em getSettings:', error);
            return {
                companyName: 'Sistema FlowCash Pro',
                initialBalance: 0,
                email: '',
                phone: '',
                address: '',
                document: ''
            };
        }
    },

    async updateSettings(settings: AppSettings): Promise<boolean> {
        if (!supabase) {
            console.error('Supabase não inicializado');
            return false;
        }

        try {
            console.log('💾 Atualizando perfil da empresa:', settings.companyName);

            // Primeiro, buscar o perfil do usuário
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('company_id')
                .single();

            if (profileError) {
                console.error('❌ Erro ao buscar profile:', profileError);
                return false;
            }

            if (!profile?.company_id) {
                console.error('❌ Company ID não encontrado no profile');
                return false;
            }

            // Atualizar o nome da empresa
            const { error: companyError } = await supabase
                .from('companies')
                .update({ name: settings.companyName })
                .eq('id', profile.company_id);

            if (companyError) {
                console.error('❌ Erro ao atualizar empresa:', companyError);
                return false;
            }

            console.log('✅ Empresa atualizada com sucesso');

            // Agora tentar atualizar os settings
            console.log('Verificando se settings existem...');
            const { data: existingSettings, error: checkError } = await supabase
                .from('settings')
                .select('id')
                .eq('company_id', profile.company_id)
                .maybeSingle(); // Usar maybeSingle em vez de single

            if (checkError) {
                console.error('Erro ao verificar settings existentes:', checkError);
                // Não vamos falhar aqui, pois o nome da empresa já foi salvo
                console.log('⚠️ Continuando mesmo com erro nos settings');
            }

            const settingsData = {
                company_id: profile.company_id,
                email: settings.email || '',
                phone: settings.phone || '',
                address: settings.address || '',
                document: settings.document || ''
            };

            try {
                if (existingSettings) {
                    console.log('Atualizando settings existentes...');
                    const { error: updateError } = await supabase
                        .from('settings')
                        .update(settingsData)
                        .eq('company_id', profile.company_id);

                    if (updateError) {
                        console.error('Erro ao atualizar settings:', updateError);
                        console.log('⚠️ Settings não foram atualizados, mas nome da empresa foi salvo');
                    } else {
                        console.log('✅ Settings atualizados com sucesso');
                    }
                } else {
                    console.log('Criando novos settings...');
                    const { error: insertError } = await supabase
                        .from('settings')
                        .insert(settingsData);

                    if (insertError) {
                        console.error('Erro ao inserir settings:', insertError);
                        console.log('⚠️ Settings não foram criados, mas nome da empresa foi salvo');
                    } else {
                        console.log('✅ Settings criados com sucesso');
                    }
                }
            } catch (settingsError) {
                console.error('Erro geral nos settings:', settingsError);
                console.log('⚠️ Problema com settings, mas nome da empresa foi salvo');
            }

            console.log('🎉 Perfil atualizado com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro geral em updateSettings:', error);
            return false;
        }
    }
};
