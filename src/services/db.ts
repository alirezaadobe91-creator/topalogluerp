import { openDB, IDBPDatabase } from 'idb';
import { Order } from '../types';

const DB_NAME = 'JewelryOrderDB';
const STORE_NAME = 'orders';
const DB_VERSION = 1;

export class DatabaseService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    const db = await this.dbPromise;
    return db.getAll(STORE_NAME);
  }

  async saveOrder(order: Order): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, order);
  }

  async deleteOrder(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, id);
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }

  // Backup & Restore
  async exportToJSON(): Promise<string> {
    const orders = await this.getAllOrders();
    return JSON.stringify(orders, null, 2);
  }

  async importFromJSON(json: string): Promise<void> {
    const orders: Order[] = JSON.parse(json);
    const db = await this.dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const order of orders) {
      await tx.store.put(order);
    }
    await tx.done;
  }
}

export const dbService = new DatabaseService();
