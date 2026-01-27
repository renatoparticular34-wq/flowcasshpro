
import { Account, AccountType, Transaction, TransactionStatus, AppSettings } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
    { id: '1', name: 'Vendas Prod. Svcs.', type: AccountType.INCOME },
    { id: '2', name: 'Aluguel', type: AccountType.EXPENSE },
    { id: '3', name: 'Energia Elétrica', type: AccountType.EXPENSE },
    { id: '4', name: 'Água', type: AccountType.EXPENSE },
    { id: '5', name: 'Internet', type: AccountType.EXPENSE },
    { id: '6', name: 'Salários', type: AccountType.EXPENSE },
    { id: '7', name: 'Fornecedores', type: AccountType.EXPENSE },
    { id: '8', name: 'Impostos', type: AccountType.EXPENSE },
];

export const INITIAL_SETTINGS: AppSettings = {
    companyName: 'Minha Empresa (Local)',
    initialBalance: 0,
    email: '',
    phone: '',
    address: '',
    document: ''
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];
