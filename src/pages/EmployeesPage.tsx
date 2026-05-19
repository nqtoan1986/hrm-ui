import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, Filter, MoreHorizontal, CreditCard as Edit, Trash2, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  position: string;
  status: string;
  join_date: string;
  avatar_url: string;
}

const departments = ['Human Resources', 'IT', 'Operations', 'Marketing', 'Finance', 'Design', 'Analytics', 'Product', 'Quality Assurance'];
const statuses = ['active', 'on_leave', 'probation', 'suspended', 'review_pending'];
const statusLabels: Record<string, string> = {
  active: 'Đang làm việc',
  on_leave: 'Nghỉ phép',
  probation: 'Thử việc',
  suspended: 'Tạm đình chỉ',
  review_pending: 'Chờ đánh giá',
};
const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  on_leave: 'bg-amber-100 text-amber-700',
  probation: 'bg-blue-100 text-blue-700',
  suspended: 'bg-red-100 text-red-700',
  review_pending: 'bg-slate-100 text-slate-700',
};

const ITEMS_PER_PAGE = 10;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    department: '', role: '', position: '', status: 'active', join_date: '',
  });

  useEffect(() => {
    loadEmployees();
  }, [page, search, filterDept, filterStatus]);

  const loadEmployees = async () => {
    setLoading(true);
    let query = supabase.from('employees').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }
    if (filterDept) query = query.eq('department', filterDept);
    if (filterStatus) query = query.eq('status', filterStatus);

    const from = (page - 1) * ITEMS_PER_PAGE;
    query = query.range(from, from + ITEMS_PER_PAGE - 1).order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (!error) {
      setEmployees(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (editingEmployee) {
      await supabase.from('employees').update(form).eq('id', editingEmployee.id);
    } else {
      await supabase.from('employees').insert(form);
    }
    setShowAddModal(false);
    setEditingEmployee(null);
    resetForm();
    loadEmployees();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      await supabase.from('employees').delete().eq('id', id);
      loadEmployees();
    }
  };

  const resetForm = () => {
    setForm({ first_name: '', last_name: '', email: '', phone: '', department: '', role: '', position: '', status: 'active', join_date: '' });
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      first_name: emp.first_name, last_name: emp.last_name, email: emp.email,
      phone: emp.phone, department: emp.department, role: emp.role,
      position: emp.position, status: emp.status, join_date: emp.join_date,
    });
    setShowAddModal(true);
    setShowActionMenu(null);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nhân viên</h1>
          <p className="text-slate-500 mt-1">Quản lý danh sách nhân viên trong hệ thống</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingEmployee(null); setShowAddModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, mã NV..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none"
            />
          </div>
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none min-w-[160px]"
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none min-w-[160px]"
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã NV</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ tên</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phòng ban</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chức vụ</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày vào</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Đang tải...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Chưa có nhân viên nào</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{emp.employee_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-accent-100 rounded-full flex items-center justify-center text-accent-700 font-semibold text-sm">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div className="text-sm font-medium text-slate-800">{emp.first_name} {emp.last_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.department || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.position || emp.role || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[emp.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabels[emp.status] || emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.join_date || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === emp.id ? null : emp.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {showActionMenu === emp.id && (
                          <div className="absolute right-0 top-8 w-40 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-10">
                            <button onClick={() => openEdit(emp)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <Edit className="w-4 h-4" /> Chỉnh sửa
                            </button>
                            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                              <Eye className="w-4 h-4" /> Xem chi tiết
                            </button>
                            <button onClick={() => handleDelete(emp.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" /> Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Hiển thị {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, total)} / {total} nhân viên
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-accent-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ</label>
                  <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên</label>
                  <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phòng ban</label>
                  <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                    <option value="">Chọn phòng ban</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Chức vụ</label>
                  <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Vai trò</label>
                  <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                    {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày vào làm</label>
                <input type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                Hủy
              </button>
              <button onClick={handleSave} className="px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-medium transition-colors">
                {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
