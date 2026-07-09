import { Order } from '../types';

export class DatabaseService {
  private storageKey = 'orders_db';

  private getOrdersFromStorage(): Order[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveOrdersToStorage(orders: Order[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
  }

  async getAllOrders(userId: string): Promise<Order[]> {
    // Filter by userId if you want, but for localStorage usually we just show everything for the device
    // or filter if multiple users share the same browser local storage (unlikely but good for consistency)
    const orders = this.getOrdersFromStorage();
    return orders.filter(o => o.userId === userId);
  }

  async saveOrder(order: Order, userId: string): Promise<void> {
    const orders = this.getOrdersFromStorage();
    const index = orders.findIndex(o => o.id === order.id);
    
    const orderWithUserId = { ...order, userId };

    if (index !== -1) {
      orders[index] = orderWithUserId;
    } else {
      orders.push(orderWithUserId);
    }

    this.saveOrdersToStorage(orders);
  }

  async deleteOrder(id: string): Promise<void> {
    let orders = this.getOrdersFromStorage();
    orders = orders.filter(o => o.id !== id);
    this.saveOrdersToStorage(orders);
  }

  async clearAll(userId: string): Promise<void> {
    let orders = this.getOrdersFromStorage();
    orders = orders.filter(o => o.userId !== userId);
    this.saveOrdersToStorage(orders);
  }

  // Backup & Restore
  async exportToJSON(userId: string): Promise<string> {
    const orders = await this.getAllOrders(userId);
    return JSON.stringify(orders, null, 2);
  }

  async importFromJSON(json: string, userId: string): Promise<void> {
    const importedOrders: Order[] = JSON.parse(json);
    const existingOrders = this.getOrdersFromStorage();
    
    // Merge or overwrite? Let's overwrite for this specific userId
    const otherUsersOrders = existingOrders.filter(o => o.userId !== userId);
    const updatedOrders = [...otherUsersOrders, ...importedOrders.map(o => ({ ...o, userId }))];
    
    this.saveOrdersToStorage(updatedOrders);
  }
}

export const dbService = new DatabaseService();
