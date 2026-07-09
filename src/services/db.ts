import { Order } from '../types';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, shouldThrow = true) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (shouldThrow) {
    throw new Error(JSON.stringify(errInfo));
  }
}

export class DatabaseService {
  private collectionName = 'orders';

  async getAllOrders(userId: string): Promise<Order[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId)
    );

    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Order);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.collectionName);
      return [];
    }
  }

  subscribeToOrders(userId: string, callback: (orders: Order[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => doc.data() as Order);
      callback(orders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, this.collectionName, false);
      callback([]); // Error durumunda boş liste dön ki loading takılı kalmasın
    });
  }

  async saveOrder(order: Order, userId: string): Promise<void> {
    const orderWithUserId = { ...order, userId, updatedAt: Date.now() };
    const docRef = doc(db, this.collectionName, order.id);

    try {
      await setDoc(docRef, orderWithUserId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${this.collectionName}/${order.id}`);
    }
  }

  async deleteOrder(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);

    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.collectionName}/${id}`);
    }
  }

  async clearAll(userId: string): Promise<void> {
    try {
      const orders = await this.getAllOrders(userId);
      for (const order of orders) {
        await this.deleteOrder(order.id);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, this.collectionName);
    }
  }

  // Backup & Restore
  async exportToJSON(userId: string): Promise<string> {
    const orders = await this.getAllOrders(userId);
    return JSON.stringify(orders, null, 2);
  }

  async importFromJSON(json: string, userId: string): Promise<void> {
    try {
      const importedOrders: Order[] = JSON.parse(json);
      for (const order of importedOrders) {
        await this.saveOrder(order, userId);
      }
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }
}

export const dbService = new DatabaseService();
