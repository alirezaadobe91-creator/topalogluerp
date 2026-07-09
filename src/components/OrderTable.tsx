import React, { useState } from 'react';
import { 
  Eye, 
  Trash2, 
  FileJson,
  Download,
  Printer,
  Store,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus, ShippingStatus } from '../types';
import { ProgressBar } from './ProgressBar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
  onExport: (type: 'json' | 'csv' | 'print') => void;
}

const statusSteps = [
  { status: OrderStatus.PENDING, label: 'Beklemede' },
  { status: OrderStatus.WORKSHOP, label: 'Atölyede' },
  { status: OrderStatus.SHIPPED, label: 'Kargoya Verildi' },
  { status: OrderStatus.DELIVERED, label: 'Teslim Edildi' },
  { status: OrderStatus.CANCELLED, label: 'İptal' },
];

export const OrderTable = ({ 
  orders, 
  onView, 
  onDelete, 
  onUpdateOrder,
  onExport 
}: OrderTableProps) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const getMarketplaceClass = (mp: string) => {
    switch (mp) {
      case 'E-Topaloglu': return 'bg-marketplace-etopaloglu';
      case 'Trendyol': return 'bg-marketplace-trendyol';
      case 'Hepsiburada': return 'bg-marketplace-hepsiburada';
      case 'N11': return 'bg-marketplace-n11';
      case 'Pazarama': return 'bg-marketplace-pazarama';
      case 'Idefix': return 'bg-marketplace-idefix';
      default: return 'bg-slate-900';
    }
  };
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Sipariş Listesi
          <span className="px-2 py-0.5 rounded-md bg-white border border-gray-100 text-[10px] font-mono text-gold shadow-sm">
            {orders.length}
          </span>
        </h3>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onExport('json')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="JSON Yedek"
          >
            <FileJson className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onExport('csv')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="CSV Dışa Aktar"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onExport('print')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Yazdır"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              <th className="px-6 py-4 w-12 text-center">#</th>
              <th className="px-6 py-4">Sipariş & Pazaryeri</th>
              <th className="px-6 py-4">Ürün / Adet</th>
              <th className="px-6 py-4">Müşteri</th>
              <th className="px-6 py-4">ERP Durumu</th>
              <th className="px-6 py-4">Sipariş Durumu</th>
              <th className="px-6 py-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className={clsx(
                    "group transition-all hover:scale-[1.01] hover:shadow-xl hover:z-10 relative overflow-hidden my-2 rounded-xl first:mt-0",
                    getMarketplaceClass(order.marketplace)
                  )}
                >
                  <td className="px-6 py-4 text-center text-[10px] font-mono text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-900 leading-none mb-1">
                        {order.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Store className="w-3 h-3" />
                        {order.marketplace}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 leading-none mb-1 uppercase">
                        {order.productName}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {order.quantity} ADET
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700 leading-none mb-1 uppercase">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {format(order.createdAt, 'dd MMM yyyy', { locale: tr })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={order.erpProcessed}
                        onChange={(e) => onUpdateOrder(order.id, { erpProcessed: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-2 border-slate-300 bg-white checked:bg-slate-900 checked:border-slate-900 transition-all cursor-pointer accent-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-tighter">
                        {order.erpProcessed ? 'İŞLENDİ' : 'BEKLİYOR'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateOrder(order.id, { status: e.target.value as OrderStatus })}
                      className="bg-white/80 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-gold/30 transition-all cursor-pointer"
                    >
                      {statusSteps.map(step => (
                        <option key={step.status} value={step.status}>{step.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onView(order);
                        }}
                        className="p-2 rounded-lg hover:bg-gold/10 text-slate-400 hover:text-gold transition-colors"
                        title="Detaylar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {confirmDelete === order.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(order.id);
                              setConfirmDelete(null);
                            }}
                            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            title="Onayla"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(null);
                            }}
                            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            title="Vazgeç"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(order.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all active:scale-90"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                  Gösterilecek sipariş bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
