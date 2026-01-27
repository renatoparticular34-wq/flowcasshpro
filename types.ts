
export enum TransactionStatus {
  PAID = 'SIM',
  PENDING = 'NÃO'
}

export enum AccountType {
  INCOME = 'Entrada',
  EXPENSE = 'Saída'
}

// Frontend Types
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  company_id?: string;
}

export interface Transaction {
  id: string;
  date: string;
  accountId: string; // mapped from account_id
  description: string;
  amount: number;
  status: TransactionStatus;
  type: AccountType;
  company_id?: string;
}

export interface AppSettings {
  companyName: string;
  initialBalance: number;
  initialBalanceDate?: string; // Format YYYY-MM-DD
  email?: string;
  phone?: string;
  address?: string;
  document?: string; // CNPJ/CPF
}

export interface MonthlyConsolidation {
  month: number;
  year: number;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  closingBalance: number;
  accountBreakdown: Record<string, number>;
}

// Database Row Types (Raw from Supabase)
export interface DBTransaction {
  id: string;
  company_id: string;
  account_id: string | null;
  description: string;
  amount: number;
  date: string;
  status: string; // 'SIM' | 'NÃO'
  type: string; // 'Entrada' | 'Saída'
  created_at?: string;
}

export interface DBAccount {
  id: string;
  company_id: string;
  name: string;
  type: string;
  created_at?: string;
}
