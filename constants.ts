
import { Account, AccountType, TransactionStatus } from './types';

export const INITIAL_INCOME_ACCOUNTS: string[] = [
  'Vendas de Produtos',
  'Prestação de Serviços',
  'Recebimentos de Cartão',
  'Rendimentos de Aplicação',
  'Outras Receitas'
];

export const INITIAL_EXPENSE_ACCOUNTS: string[] = [
  'Fornecedores',
  'Salários e Encargos',
  'Aluguel',
  'Energia / Água',
  'Internet / Telefone',
  'Marketing',
  'Impostos',
  'Manutenção',
  'Retirada de Sócios'
];

export const MAX_ACCOUNTS_PER_TYPE = 17; // C5-C21 and D5-D21

export const DEFAULT_ACCOUNTS: Account[] = [
  ...INITIAL_INCOME_ACCOUNTS.map((name, i) => ({ id: `in-${i}`, name, type: AccountType.INCOME })),
  ...INITIAL_EXPENSE_ACCOUNTS.map((name, i) => ({ id: `out-${i}`, name, type: AccountType.EXPENSE }))
];
