
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Transaction, Account, AppSettings, TransactionStatus, AccountType } from '../types';

const getUserSubcollection = (collectionName: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, "users", user.uid, collectionName);
};

export const firebaseService = {
    // --- Transactions ---

    async getTransactions(): Promise<Transaction[]> {
        console.log("📦 Buscando transações...");
        try {
            if (!auth.currentUser) {
                console.log("⚠️ Usuário não autenticado, retornando []");
                return [];
            }

            const colRef = getUserSubcollection("transactions");
            console.log("📂 Coleção:", colRef.path);

            const querySnapshot = await getDocs(colRef);
            console.log("✅ Transações encontradas:", querySnapshot.size);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    date: data.date,
                    accountId: data.accountId,
                    description: data.description,
                    amount: Number(data.amount),
                    status: data.status as TransactionStatus,
                    type: data.type as AccountType,
                    company_id: data.company_id
                } as Transaction;
            });
        } catch (error) {
            console.error("❌ Erro ao buscar transações:", error);
            return [];
        }
    },


    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        console.log("➕ Criando transação:", transaction);
        try {
            if (!auth.currentUser) {
                console.error("❌ Usuário não autenticado!");
                return null;
            }
            const col = getUserSubcollection("transactions");
            console.log("📂 Coleção:", col.path);
            const docRef = await addDoc(col, transaction);
            console.log("✅ Transação criada com ID:", docRef.id);
            return { ...transaction, id: docRef.id };
        } catch (error) {
            console.error("❌ Erro ao criar transação:", error);
            return null;
        }
    },


    async deleteTransaction(id: string): Promise<boolean> {
        try {
            if (!auth.currentUser) return false;
            await deleteDoc(doc(db, "users", auth.currentUser.uid, "transactions", id));
            return true;
        } catch (error) {
            console.error("Error deleting transaction:", error);
            return false;
        }
    },

    async updateTransaction(transaction: Transaction): Promise<boolean> {
        try {
            if (!auth.currentUser) return false;
            const { id, ...data } = transaction;
            await updateDoc(doc(db, "users", auth.currentUser.uid, "transactions", id), data as any);
            return true;
        } catch (error) {
            console.error("Error updating transaction:", error);
            return false;
        }
    },

    // --- Accounts ---

    async getAccounts(): Promise<Account[]> {
        console.log("📦 Buscando contas...");
        try {
            if (!auth.currentUser) {
                console.log("⚠️ Usuário não autenticado, retornando []");
                return [];
            }

            const colRef = getUserSubcollection("accounts");
            console.log("📂 Coleção:", colRef.path);

            const querySnapshot = await getDocs(colRef);
            console.log("✅ Contas encontradas:", querySnapshot.size);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    type: data.type as AccountType,
                    company_id: data.company_id
                };
            });
        } catch (error) {
            console.error("❌ Erro ao buscar contas:", error);
            return [];
        }
    },

    async createAccount(name: string, type: AccountType): Promise<Account | null> {
        console.log("➕ Criando conta:", name, type);
        try {
            const col = getUserSubcollection("accounts");
            const payload = { name, type };
            const docRef = await addDoc(col, payload);
            console.log("✅ Conta criada com ID:", docRef.id);
            return { id: docRef.id, ...payload };
        } catch (error) {
            console.error("❌ Erro ao criar conta:", error);
            return null;
        }
    },

    async updateAccount(account: Account): Promise<boolean> {
        try {
            if (!auth.currentUser) return false;
            const { id, ...data } = account;
            await updateDoc(doc(db, "users", auth.currentUser.uid, "accounts", id), data as any);
            return true;
        } catch (error) {
            console.error("Error updating account:", error);
            return false;
        }
    },

    async deleteAccount(id: string): Promise<boolean> {
        try {
            if (!auth.currentUser) return false;
            await deleteDoc(doc(db, "users", auth.currentUser.uid, "accounts", id));
            return true;
        } catch (error) {
            console.error("Error deleting account:", error);
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
            if (!auth.currentUser) {
                console.log("⚠️ Usuário não autenticado, retornando padrão");
                return defaultSettings;
            }

            // Usar getDocs em vez de getDoc para contornar bug de "offline"
            const settingsCol = collection(db, "users", auth.currentUser.uid, "settings");
            console.log("📂 Coleção:", settingsCol.path);

            const querySnapshot = await getDocs(settingsCol);
            console.log("✅ Documentos de settings encontrados:", querySnapshot.size);

            if (!querySnapshot.empty) {
                const firstDoc = querySnapshot.docs[0];
                return firstDoc.data() as AppSettings;
            } else {
                console.log("ℹ️ Nenhuma config encontrada, retornando padrão");
                return defaultSettings;
            }
        } catch (error) {
            console.error("❌ Erro ao buscar configurações:", error);
            return defaultSettings;
        }
    },


    async updateSettings(settings: AppSettings): Promise<boolean> {
        try {
            if (!auth.currentUser) return false;
            const docRef = doc(db, "users", auth.currentUser.uid, "settings", "main");
            await setDoc(docRef, settings, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating settings:", error);
            return false;
        }
    }
};
