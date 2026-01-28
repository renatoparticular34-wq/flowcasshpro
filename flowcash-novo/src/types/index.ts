export enum AccountType {
    INCOME = 'income',
    EXPENSE = 'expense'
}

export enum TransactionStatus {
    PAID = 'realized',
    PENDING = 'forecast'
}

export interface Account {
    id: string;
    name: string;
    type: AccountType;
}

export interface Transaction {
    id: string;
    date: string;
    accountId: string;
    description: string;
    amount: number;
    status: TransactionStatus;
    type: AccountType;
}

export interface AppSettings {
    companyName: string;
    initialBalance: number;
    email: string;
    phone: string;
    address: string;
    document: string;
}
