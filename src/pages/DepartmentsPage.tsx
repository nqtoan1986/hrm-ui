import { useState, useMemo } from 'react';
import { Building2, Users, ChevronRight, LayoutGrid, List, Search, Plus, CreditCard as Edit, Trash2, X } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  headcount: number;
  head: string;
  color: string;
  email?: string;
  location?: string;
  budget?: string;
}

const departmentsData: Department[] = [
  { id: '1', name: 'Human Resources', headcount: 12, head: 'Nguyễn Thị Lan', color: 'bg-accent-500', email: 'hr@mcv.com.vn', location: 'Tầng 3', budget: '500M VND' },
  { id: '2', name: 'IT', headcount: 45, head: 'Trần Văn Minh', color: 'bg-blue-500', email: 'it@mcv.com.vn', location: 'Tầng 2-3', budget: '2.5B VND' },
  { id: '3', name: 'Operations', headcount: 28, head: 'Lê Hoàng Nam', color: 'bg-emerald-500', email: 'ops@mcv.com.vn', location: 'Tầng 4', budget: '1.2B VND' },
  { id: '4', name: 'Marketing', headcount: 18, head: 'Phạm Thu Hà', color: 'bg-amber-500', email: 'marketing@mcv.com.vn', location: 'Tầng 2', budget: '800M VND' },
  { id: '5', name: 'Finance', headcount: 15, head: 'Võ Thanh Tùng', color: 'bg-cyan-500', email: 'finance@mcv.com.vn', location: 'Tầng 5', budget: '600M VND' },
  { id: '6', name: 'Design', headcount: 10, head: 'Đặng Minh Khoa', color: 'bg-rose-500', email: 'design@mcv.com.vn', location: 'Tầng 2', budget: '400M VND' },
  { id: '7', name: 'Analytics', headcount: 8, head: 'Ngô Quang Huy', color: 'bg-violet-500', email: 'analytics@mcv.com.vn', location: 'Tầng 4', budget: '300M VND' },
  { id: '8', name: 'Product', headcount: 14, head: 'Huỳnh Thị Mai', color: 'bg-orange-500', email: 'product@mcv.com.vn', location: 'Tầng 3', budget: '700M VND' },
  { id: '9', name: 'Quality Assurance', headcount: 9, head: 'Lý Văn Đức', color: 'bg-slate-500', email: 'qa@mcv.com.vn', location: 'Tầng 1', budget: '350M VND' },
];

const ITEMS_PER_PAGE = 6;

export default function DepartmentsPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', head: '', headcount: 0, email: '', location: '', budget: '' });

  const filtered = useMemo(() => {
    return departmentsData.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.head.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const paged = view === 'grid' ? filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE) : filtered;
  const totalPages = view === 'grid' ? Math.ceil(filtered.length / ITEMS_PER_PAGE) : 1;
  const total = filtered.length;

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setForm({ name: dept.name, head: dept.head, headcount: dept.headcount, email: dept.email || '', location: dept.location || '', budget: dept.budget || '' });
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ name: '', head: '', headcount: 0, email: '', location: '', budget: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-8 backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Phòng ban</h1>
            <p className="text-slate-300 mt-2">Danh sách các phòng ban trong công ty</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2.5 rounded-lg transition-all ${view === 'grid' ? 'bg-accent-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="Lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-2.5 rounded-lg transition-all ${view === 'table' ? 'bg-accent-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="Danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tổng phòng ban', value: total, icon: Building2, color: 'from-accent-500' },
          { label: 'Tổng nhân viên', value: departmentsData.reduce((s, d) => s + d.headcount, 0), icon: Users, color: 'from-blue-500' },
          { label: 'Trung bình/phòng', value: Math.round(departmentsData.reduce((s, d) => s + d.headcount, 0) / departmentsData.length), icon: Users, color: 'from-emerald-500' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-gradient-to-br ${stat.color} to-slate-700 rounded-xl p-5 text-white shadow-lg border border-white/10 backdrop-blur-xl transform hover:scale-105 transition-transform duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/20 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm phòng ban hoặc trưởng phòng..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paged.map((dept, idx) => (
              <div
                key={dept.id}
                className="bg-white/60 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:shadow-xl hover:border-accent-200 transition-all duration-300 cursor-pointer group transform hover:scale-105"
                style={{
                  animation: `slideIn 0.3s ease-out ${idx * 30}ms backwards`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${dept.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <button onClick={() => openEdit(dept)} className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-accent-500 hover:bg-accent-50 rounded-lg transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-lg group-hover:text-accent-600 transition-colors">{dept.name}</h3>
                <p className="text-sm text-slate-600 mb-1">Trưởng: {dept.head}</p>
                <p className="text-xs text-slate-400 mb-4">{dept.location}</p>
                <div className="flex items-center gap-2 pt-4 border-t border-white/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">{dept.headcount} nhân viên</span>
                    </div>
                    <div className="text-xs text-slate-500">{dept.budget}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-accent-500 transition-colors transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for grid */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${page === p ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg' : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/20'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Table View */
        <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-white/20">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Phòng ban</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Trưởng phòng</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Vị trí</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Nhân viên</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngân sách</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Không tìm thấy phòng ban</td>
                  </tr>
                ) : (
                  paged.map((dept, idx) => (
                    <tr key={dept.id} className="hover:bg-accent-50/50 transition-all duration-200" style={{ animation: `slideIn 0.3s ease-out ${idx * 30}ms backwards` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 ${dept.color} rounded-lg flex items-center justify-center`}>
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold text-slate-800">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{dept.head}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{dept.location}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                          <Users className="w-4 h-4" />
                          {dept.headcount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{dept.email}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{dept.budget}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEdit(dept)} className="p-1.5 text-slate-400 hover:text-accent-500 hover:bg-accent-50 rounded-lg transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {paged.length > 0 && (
            <div className="px-6 py-4 border-t border-white/20 bg-gradient-to-r from-white/40 to-white/20 text-sm text-slate-600 font-medium">
              Hiển thị {paged.length} / {total} phòng ban
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl w-full max-w-lg shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-gradient-to-r from-white/40 to-white/20">
              <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa phòng ban</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên phòng ban</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Trưởng phòng</label>
                <input value={form.head} onChange={e => setForm({ ...form, head: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số nhân viên</label>
                  <input type="number" value={form.headcount} onChange={e => setForm({ ...form, headcount: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vị trí</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngân sách</label>
                <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none transition-all" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/20 flex justify-end gap-3 bg-gradient-to-r from-white/40 to-white/20">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white/50 rounded-lg transition-all">
                Đóng
              </button>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
