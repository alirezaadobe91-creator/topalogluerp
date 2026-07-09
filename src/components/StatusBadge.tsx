import { 
  CircleDot, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { OrderStatus } from '../types';
import { clsx } from 'clsx';

const statusConfig = {
  [OrderStatus.PENDING]: {
    label: "Beklemede",
    icon: Clock,
    color: 'bg-slate-100 text-slate-700',
  },
  [OrderStatus.WORKSHOP]: {
    label: 'Atölyede',
    icon: CircleDot,
    color: 'bg-blue-100 text-blue-700',
  },
  [OrderStatus.SHIPPED]: {
    label: 'Kargolandı',
    icon: Truck,
    color: 'bg-purple-100 text-purple-700',
  },
  [OrderStatus.DELIVERED]: {
    label: 'Teslim Edildi',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700',
  },
  [OrderStatus.CANCELLED]: {
    label: 'İptal',
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
  },
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={clsx('status-badge', config.color)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
