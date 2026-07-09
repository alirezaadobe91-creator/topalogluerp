import { useState, useEffect, useMemo } from 'react';
import { 
  Diamond, 
  Search, 
  Filter, 
  Bell, 
  Download, 
  Upload, 
  Settings, 
  Plus,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from './services/db';
import { Order, OrderStatus, Theme, DashboardStats } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { StatsCards } from './components/StatsCards';
import { AddOrderForm } from './components/AddOrderForm';
import { OrderTable } from './components/OrderTable';
import { OrderDetailPanel } from './components/OrderDetailPanel';
import { DashboardCharts } from './components/DashboardCharts';
import { isToday, format } from 'date-fns';
import { clsx } from 'clsx';
import { useAuth } from './hooks/useAuth';
import { AuthScreen } from './components/AuthScreen';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('HEPSİ');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [showFilters, setShowFilters] = useState(false);
  const [erpFilter, setErpFilter] = useState<'ALL' | 'PROCESSED' | 'PENDING'>('ALL');
  const [marketplaceFilter, setMarketplaceFilter] = useState<string>('HEPSİ');

  // Load Initial Data & Subscribe
  useEffect(() => {
    if (!user) return;
    
    // Gerçek zamanlı veri takibi
    const unsubscribe = dbService.subscribeToOrders(user.uid, (data) => {
      setOrders(data);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, [user]);

  // Force Light Theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Statistics
  const stats: DashboardStats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
    return {
      totalOrders: total,
      preparing: orders.filter(o => [OrderStatus.PENDING, OrderStatus.WORKSHOP].includes(o.status)).length,
      shipped: orders.filter(o => o.status === OrderStatus.SHIPPED).length,
      delivered: completed,
      cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
      todayCount: orders.filter(o => isToday(o.createdAt)).length,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [orders]);

  // Filtered Orders
  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        alert('Veriler otomatik olarak kaydedilmektedir.');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder="Hızlı Arama..."]')?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredOrders = useMemo(() => {
    const statusMap: Record<string, string> = {
      'HEPSİ': 'ALL',
      'BEKLEMEDE': OrderStatus.PENDING,
      'ATÖLYEDE': OrderStatus.WORKSHOP,
      'KARGOYA VERİLDİ': OrderStatus.SHIPPED,
      'TESLİM EDİLDİ': OrderStatus.DELIVERED,
      'İPTAL': OrderStatus.CANCELLED
    };

    return orders
      .filter(order => {
        const matchesSearch = 
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const filterValue = statusMap[statusFilter];
        const matchesFilter = filterValue === 'ALL' || order.status === filterValue;
        
        const matchesErpFilter = erpFilter === 'ALL' || 
          (erpFilter === 'PROCESSED' && order.erpProcessed) || 
          (erpFilter === 'PENDING' && !order.erpProcessed);
        
        const matchesMarketplaceFilter = marketplaceFilter === 'HEPSİ' || order.marketplace === marketplaceFilter;
        
        return matchesSearch && matchesFilter && matchesErpFilter && matchesMarketplaceFilter;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, searchQuery, statusFilter, erpFilter, marketplaceFilter]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // Actions
  const handleAddOrder = async (order: Order) => {
    if (!user) return;
    try {
      await dbService.saveOrder(order, user.uid);
      const data = await dbService.getAllOrders(user.uid);
      setOrders(data);
    } catch (err: any) {
      console.error('Sipariş kaydedilirken hata:', err);
      alert(`Sipariş kaydedilemedi: ${err.message}`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!user) return;
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    try {
      await dbService.deleteOrder(id);
      const data = await dbService.getAllOrders(user.uid);
      setOrders(data);
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (err: any) {
      console.error('Sipariş silinirken hata:', err);
      alert(`Sipariş silinemedi: ${err.message}`);
    }
  };

  const handleUpdateOrder = async (id: string, updates: Partial<Order>) => {
    if (!user) return;
    const order = orders.find(o => o.id === id);
    if (!order) return;

    try {
      let newStatus = updates.status || order.status;
      let newProgress = order.progress;

      if (updates.status) {
        const statusOrder = [
          OrderStatus.PENDING,
          OrderStatus.WORKSHOP,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED
        ];
        
        if (newStatus !== OrderStatus.CANCELLED) {
          const idx = statusOrder.indexOf(newStatus);
          newProgress = idx === -1 ? 0 : Math.round(((idx + 1) / statusOrder.length) * 100);
        }
      }

      const updatedOrder: Order = {
        ...order,
        ...updates,
        progress: newProgress,
        updatedAt: Date.now(),
        history: updates.status ? [
          ...order.history,
          { status: newStatus, timestamp: Date.now() }
        ] : order.history
      };

      await dbService.saveOrder(updatedOrder, user.uid);
      const data = await dbService.getAllOrders(user.uid);
      setOrders(data);
      if (selectedOrder?.id === id) setSelectedOrder(updatedOrder);
    } catch (err: any) {
      console.error('Sipariş güncellenirken hata:', err);
      alert(`Sipariş güncellenemedi: ${err.message}`);
    }
  };

  const handleExport = async (type: 'json' | 'csv' | 'print') => {
    if (!user) return;
    if (type === 'json') {
      const data = await dbService.exportToJSON(user.uid);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
    } else if (type === 'csv') {
      const headers = 'Siparis No,Urun,Musteri,Pazaryeri,Tarih,Durum,Ilerleme\n';
      const rows = orders.map(o => 
        `${o.id},${o.productName},${o.customerName},${o.marketplace},${format(o.createdAt, 'dd.MM.yyyy')},${o.status},%${o.progress}`
      ).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
    } else if (type === 'print') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-gold/30">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/logo/black-logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=TOPALOGLU&background=C5A059&color=fff';
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">TOPALOGLU ERP</h1>
              <div className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Sipariş Takip Paneli</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end mr-2 hidden sm:flex">
              <span className="text-[10px] font-black text-slate-900 tracking-tight uppercase">{user?.displayName || 'Kullanıcı'}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user?.email}</span>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100 mr-2"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Hızlı Arama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-gray-100/50 border border-transparent focus:border-gold/50 focus:ring-4 focus:ring-gold/5 outline-none transition-all w-64 text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-12">
        <AddOrderForm onAdd={handleAddOrder} />

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
                  <ListOrdered className="w-5 h-5 text-gold" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Sipariş Listesi</h2>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={clsx(
                  "px-4 py-2 rounded-xl border font-bold text-[10px] tracking-widest transition-all flex items-center gap-2", 
                  showFilters ? "bg-gold text-white border-gold shadow-lg shadow-gold/20" : "bg-white text-gray-500 border-gray-100 hover:border-gold/30"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                FİLTRELE
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Sipariş No, Ürün veya Müşteri Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-100 focus:border-gold/50 focus:ring-4 focus:ring-gold/5 outline-none transition-all text-sm font-medium shadow-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-8 overflow-hidden mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block tracking-widest">Sipariş Durumu</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['HEPSİ', 'BEKLEMEDE', 'ATÖLYEDE', 'KARGOYA VERİLDİ', 'TESLİM EDİLDİ', 'İPTAL'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={clsx(
                              'px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all text-left flex items-center justify-between group',
                              statusFilter === status 
                                ? 'bg-gold text-white shadow-lg shadow-gold/20' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            )}
                          >
                            {status}
                            <div className={clsx(
                              "w-1 h-1 rounded-full",
                              statusFilter === status ? "bg-white" : "bg-gold/30 group-hover:bg-gold"
                            )} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block tracking-widest">ERP Durumu</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'ALL', label: 'HEPSİ' },
                          { id: 'PROCESSED', label: 'ERP\'YE EKLENDİ' },
                          { id: 'PENDING', label: 'BEKLİYOR' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setErpFilter(item.id as any)}
                            className={clsx(
                              'px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all text-left flex items-center justify-between group',
                              erpFilter === item.id 
                                ? 'bg-gold text-white shadow-lg shadow-gold/20' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            )}
                          >
                            {item.label}
                            <div className={clsx(
                              "w-1 h-1 rounded-full",
                              erpFilter === item.id ? "bg-white" : "bg-gold/30 group-hover:bg-gold"
                            )} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block tracking-widest">Pazaryeri</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['HEPSİ', 'E-Topaloglu', 'Trendyol', 'Hepsiburada', 'N11', 'Pazarama', 'Idefix'].map((mp) => {
                          const mpClass = mp === 'HEPSİ' ? '' : `bg-marketplace-${mp.toLowerCase().replace('e-topaloglu', 'etopaloglu')}`;
                          const isSelected = marketplaceFilter === mp;
                          
                          return (
                            <button
                              key={mp}
                              onClick={() => setMarketplaceFilter(mp)}
                              className={clsx(
                                'px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all text-left flex items-center justify-between group border-2',
                                isSelected 
                                  ? (mp === 'HEPSİ' ? 'bg-gold text-white border-gold shadow-lg shadow-gold/20' : `${mpClass} border-slate-900 shadow-sm scale-[1.02]`)
                                  : (mp === 'HEPSİ' ? 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100' : `${mpClass} border-transparent opacity-70 hover:opacity-100`)
                              )}
                            >
                              {mp.toUpperCase()}
                              <div className={clsx(
                                "w-1 h-1 rounded-full",
                                isSelected ? (mp === 'HEPSİ' ? "bg-white" : "bg-slate-900") : "bg-gold/30 group-hover:bg-gold"
                              )} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <button 
                      onClick={() => {
                        setStatusFilter('HEPSİ');
                        setErpFilter('ALL');
                        setMarketplaceFilter('HEPSİ');
                      }}
                      className="px-6 py-2 rounded-xl border border-gray-200 text-[10px] font-bold text-gray-400 hover:text-gold hover:border-gold transition-all"
                    >
                      FİLTRELERİ TEMİZLE
                    </button>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="px-8 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all shadow-lg"
                      >
                        FİLTRELERİ UYGULA
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <OrderTable 
                orders={filteredOrders}
                onView={setSelectedOrder}
                onEdit={setSelectedOrder}
                onDelete={handleDeleteOrder}
                onUpdateOrder={handleUpdateOrder}
                onExport={handleExport}
              />
            </div>
          </div>
        </div>

        {/* Always Visible Statistics Section */}
        <div className="space-y-8 pt-12 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Genel İstatistikler</h2>
          </div>
          <StatsCards stats={stats} />
          <DashboardCharts orders={orders} />
        </div>
      </main>

      <OrderDetailPanel 
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={handleUpdateOrder}
      />

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-gold">
          <Diamond className="w-4 h-4" />
          <span className="font-bold tracking-widest text-xs uppercase">TOPALOGLU ERP</span>
        </div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
          © 2026 Crafted for Excellence • Professional Order Management
        </p>
      </footer>
    </div>
  );
}

function StatsMini({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className={clsx("text-lg font-black leading-none", color)}>{value}</div>
      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
