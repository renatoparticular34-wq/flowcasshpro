
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    where,
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
        try {
            if (!auth.currentUser) return [];

            const q = query(
                getUserSubcollection("transactions"),
                orderBy("date", "desc")
            );

            const querySnapshot = await getDocs(q);
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
            console.error("Error fetching transactions:", error);
            return [];
        }
    },

    async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> {
        try {
            const col = getUserSubcollection("transactions");
            const docRef = await addDoc(col, transaction);
            return { ...transaction, id: docRef.id };
        } catch (error) {
            console.error("Error creating transaction:", error);
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
        try {
            if (!auth.currentUser) return [];

            const q = query(getUserSubcollection("accounts"), orderBy("name"));
            const querySnapshot = await getDocs(q);

            // If no accounts exist (first login?), we might want to create defaults,
            // but for now let's just return what's there.
            // The frontend might handle seeding default accounts.

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
            console.error("Error fetching accounts:", error);
            return [];
        }
    },

    async createAccount(name: string, type: AccountType): Promise<Account | null> {
        try {
            const col = getUserSubcollection("accounts");
            const payload = { name, type };
            const docRef = await addDoc(col, payload);
            return { id: docRef.id, ...payload };
        } catch (error) {
            console.error("Error creating account:", error);
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

        try {
            if (!auth.currentUser) return defaultSettings;

            const docRef = doc(db, "users", auth.currentUser.uid, "settings", "main");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as AppSettings;
            } else {
                return defaultSettings;
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
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
