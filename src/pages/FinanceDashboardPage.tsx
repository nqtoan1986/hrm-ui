import { BarChart3, CreditCard, Receipt, BookOpen, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function FinanceDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Finance - Tong quan</h1>
        <p className="text-slate-500 mt-1">Quan ly tai chinh va ke toan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: 'Doanh thu thang', value: '8.2B VND', icon: TrendingUp, color: 'bg-emerald-50', textColor: 'text-emerald-700', trend: '+10%' },
          { label: 'Hoa don cho', value: '23', icon: CreditCard, color: 'bg-amber-50', textColor: 'text-amber-700', trend: '-3%' },
          { label: 'Chi phi', value: '3.1B VND', icon: Receipt, color: 'bg-red-50', textColor: 'text-red-700', trend: '+2%' },
          { label: 'Loi nhuan', value: '5.1B VND', icon: BookOpen, color: 'bg-blue-50', textColor: 'text-blue-700', trend: '+18%' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{card.value}</p>
                </div>
                <div className={`w-11 h-11 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">{card.trend}</span>
                <span className="text-xs text-slate-400 ml-1">so voi thang truoc</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700">Finance Dashboard</h3>
        <p className="text-sm text-slate-400 mt-1">Tinh nang dang duoc phat trien. Vui long quay lai sau.</p>
      </div>
    </div>
  );
}
