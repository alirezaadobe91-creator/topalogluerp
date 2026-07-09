import React, { useState, useEffect } from 'react';
import { Plus, Package, User, FileText, Store, Hash, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, OrderStatus, Marketplace } from '../types';

interface AddOrderFormProps {
  onAdd: (order: Order) => void;
}

const MARKETPLACES: Marketplace[] = ['E-Topaloglu', 'Trendyol', 'Hepsiburada', 'N11', 'Pazarama', 'Idefix'];

const generateRandomCode = () => `ORD-${Math.floor(Math.random() * 900000) + 100000}`;

export const AddOrderForm = ({ onAdd }: AddOrderFormProps) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [marketplace, setMarketplace] = useState<Marketplace>('E-Topaloglu');
  const [orderNote, setOrderNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !customerName) return;

    const newOrder: any = {
      id: `ORD-${Math.floor(Math.random() * 900000) + 100000}`,
      productName,
      quantity,
      customerName,
      marketplace,
      orderNote,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: OrderStatus.PENDING,
      erpProcessed: false,
      progress: 0,
      history: [
        {
          status: OrderStatus.PENDING,
          timestamp: Date.now(),
          note: 'Sipariş oluşturuldu.',
        },
      ],
    };

    onAdd(newOrder);
    setProductName('');
    setQuantity(1);
    setCustomerName('');
    setOrderNote('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-gold/10 text-gold">
          <Plus className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Yeni Sipariş Ekle</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
        <div className="space-y-2 lg:col-span-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
            Ürün Adı
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ürün ismi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
            Ürün Adeti
          </label>
          <div className="relative">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
            Müşteri Adı
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Müşteri ismi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
            Pazaryeri
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value as Marketplace)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all appearance-none cursor-pointer"
            >
              {MARKETPLACES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
            Sipariş Notu
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Not ekleyin..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            />
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-end pt-4">
          <button
            type="submit"
            className="w-full md:w-auto gold-button px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 group shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Siparişi Kaydet
          </button>
        </div>
      </form>
    </motion.div>
  );
};
