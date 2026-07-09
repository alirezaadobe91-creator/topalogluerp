import { 
  ShoppingBag, 
  Clock, 
  Truck, 
  CheckCircle2, 
  TrendingUp,
  XCircle,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { DashboardStats } from '../types';

export const StatsCards = ({ stats }: { stats: DashboardStats }) => {
  const cards = [
    { label: 'Toplam Sipariş', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Bugün Eklenen', value: stats.todayCount, icon: Calendar, color: 'text-gold' },
    { label: 'Hazırlanan', value: stats.preparing, icon: Clock, color: 'text-orange-500' },
    { label: 'Kargolanan', value: stats.shipped, icon: Truck, color: 'text-purple-500' },
    { label: 'Teslim Edilen', value: stats.delivered, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'İptaller', value: stats.cancelled, icon: XCircle, color: 'text-red-500' },
    { label: 'Tamamlanma Oranı', value: `%${stats.completionRate.toFixed(1)}`, icon: TrendingUp, color: 'text-teal-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
          className="glass-card p-4 flex flex-col items-center text-center group"
        >
          <div className={`p-2 rounded-xl bg-slate-50 mb-3 group-hover:scale-110 transition-transform ${card.color}`}>
            <card.icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase tracking-tighter text-gray-400 font-bold mb-1">{card.label}</span>
          <span className="text-xl font-black text-gray-900">{card.value}</span>
        </motion.div>
      ))}
    </div>
  );
};
