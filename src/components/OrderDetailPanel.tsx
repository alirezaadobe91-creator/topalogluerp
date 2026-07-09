import { X, CheckCircle2, Clock, History, FileText, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { clsx } from 'clsx';

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
  onUpdateOrder: (id: string, updates: Partial<Order>) => void;
}

export const OrderDetailPanel = ({ order, onClose, onUpdateOrder }: OrderDetailPanelProps) => {
  if (!order) return null;

  const statusOptions = [
    { status: OrderStatus.PENDING, label: "Beklemede" },
    { status: OrderStatus.WORKSHOP, label: 'Atölyede' },
    { status: OrderStatus.SHIPPED, label: 'Kargoya Verildi' },
    { status: OrderStatus.DELIVERED, label: 'Teslim Edildi' },
    { status: OrderStatus.CANCELLED, label: 'İptal' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/5 backdrop-blur-sm pointer-events-auto"
        />
        
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col pointer-events-auto border-l border-gray-100"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gold uppercase tracking-widest mb-1">Sipariş Detayı</div>
              <h2 className="text-2xl font-bold text-gray-900">{order.id}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 bg-white">
                <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-tighter">Mevcut Durum</div>
                <StatusBadge status={order.status} />
              </div>
              <div className="glass-card p-4 bg-white">
                <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-tighter">İlerleme</div>
                <div className="text-lg font-black text-slate-900">%{order.progress}</div>
              </div>
            </div>

            {/* Info */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Sipariş Bilgileri
              </h4>
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Müşteri</div>
                    <div className="text-sm font-semibold text-slate-900 uppercase">{order.customerName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Ürün</div>
                    <div className="text-sm font-semibold text-slate-900 uppercase">{order.productName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Pazaryeri</div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gold">
                      <Store className="w-4 h-4" />
                      {order.marketplace}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">ERP Durumu</div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      {order.erpProcessed ? (
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> İşlendi</span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1"><Clock className="w-4 h-4" /> Bekliyor</span>
                      )}
                    </div>
                  </div>
                </div>
                {order.orderNote && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Sipariş Notu</div>
                    <div className="text-sm text-slate-600 leading-relaxed italic">
                      "{order.orderNote}"
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Status Update Bar */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Durum Güncelleme
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.status}
                    onClick={() => onUpdateOrder(order.id, { status: opt.status })}
                    className={clsx(
                      'flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98]',
                      order.status === opt.status
                        ? 'bg-gold/5 border-gold shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    )}
                  >
                    <span className={clsx(
                      'text-sm font-bold',
                      order.status === opt.status ? 'text-gold' : 'text-slate-500'
                    )}>
                      {opt.label}
                    </span>
                    {order.status === opt.status && (
                      <CheckCircle2 className="w-4 h-4 text-gold" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* History / Timeline */}
            <section className="space-y-4 pb-12">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                İşlem Geçmişi
              </h4>
              <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {order.history.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="relative pl-8 flex flex-col gap-1">
                    <div className={clsx(
                      "absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                      idx === 0 ? "bg-gold scale-110" : "bg-slate-200"
                    )} />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <Clock className="w-3 h-3" />
                      {format(entry.timestamp, 'dd.MM.yyyy HH:mm', { locale: tr })}
                    </div>
                    <div className={clsx(
                      "text-sm font-bold",
                      idx === 0 ? "text-slate-900" : "text-slate-500"
                    )}>
                      {statusOptions.find(i => i.status === entry.status)?.label || entry.status}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
