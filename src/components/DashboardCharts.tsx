import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart, 
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { Order, OrderStatus } from '../types';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DashboardChartsProps {
  orders: Order[];
}

export const DashboardCharts = ({ orders }: DashboardChartsProps) => {
  // 1. Daily Orders (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const count = orders.filter(o => isSameDay(o.createdAt, date)).length;
    return {
      name: format(date, 'EEE', { locale: tr }),
      count,
    };
  });

  // 2. Status Distribution
  const statusCounts = Object.values(OrderStatus).map(status => {
    const count = orders.filter(o => o.status === status).length;
    return { name: status, value: count };
  }).filter(s => s.value > 0);

  const COLORS = ['#D4AF37', '#3B82F6', '#F97316', '#A855F7', '#22C55E', '#EF4444'];

  const statusLabels: Record<string, string> = {
    [OrderStatus.PENDING]: 'Beklemede',
    [OrderStatus.WORKSHOP]: 'Atölyede',
    [OrderStatus.SHIPPED]: 'Kargoya Verildi',
    [OrderStatus.DELIVERED]: 'Teslim Edildi',
    [OrderStatus.CANCELLED]: 'İptal',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Chart */}
      <div className="glass-card p-6">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Son 7 Günlük Sipariş</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                  backdropFilter: 'blur(12px)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#D4AF37" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="glass-card p-6">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Durum Dağılımı</h4>
        <div className="h-[250px] w-full flex flex-col md:flex-row items-center">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(12px)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0 pr-4">
            {statusCounts.map((s, idx) => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] font-bold text-gray-500 uppercase">{statusLabels[s.name] || s.name}</span>
                <span className="text-xs font-bold ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
