import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, CheckCircle, XCircle, Clock, CalendarDays } from 'lucide-react';

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  employees: { first_name: string; last_name: string; employee_id: string } | null;
}

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const leaveTypeLabels: Record<string, string> = {
  annual: 'Nghỉ phép năm',
  sick: 'Nghỉ ốm',
  personal: 'Việc cá nhân',
  maternity: 'Thai sản',
  unpaid: 'Nghỉ không lương',
};

const leaveTypeColors: Record<string, string> = {
  annual: 'bg-accent-100 text-accent-700',
  sick: 'bg-red-100 text-red-700',
  personal: 'bg-blue-100 text-blue-700',
  maternity: 'bg-pink-100 text-pink-700',
  unpaid: 'bg-slate-100 text-slate-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    employee_id: '', leave_type: 'annual', start_date: '', end_date: '', reason: '',
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    const [leaveRes, empRes] = await Promise.all([
      supabase.from('leave_requests').select('*, employees(first_name, last_name, employee_id)').order('created_at', { ascending: false }),
      supabase.from('employees').select('id, first_name, last_name, employee_id').eq('status', 'active').order('first_name'),
    ]);
    setLeaves(leaveRes.data || []);
    setEmployees(empRes.data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.start_date || !form.end_date) return;
    await supabase.from('leave_requests').insert({
      employee_id: form.employee_id,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
    });
    setShowModal(false);
    setForm({ employee_id: '', leave_type: 'annual', start_date: '', end_date: '', reason: '' });
    loadData();
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    await supabase.from('leave_requests').update({ status }).eq('id', id);
    loadData();
  };

  const filteredLeaves = filterStatus ? leaves.filter(l => l.status === filterStatus) : leaves;

  const summary = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Xin nghỉ phép</h1>
          <p className="text-slate-500 mt-1">Quản lý đơn xin nghỉ phép của nhân viên</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo đơn nghỉ phép
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng đơn', value: summary.total, icon: CalendarDays, color: 'bg-slate-50', textColor: 'text-slate-700' },
          { label: 'Chờ duyệt', value: summary.pending, icon: Clock, color: 'bg-amber-50', textColor: 'text-amber-700' },
          { label: 'Đã duyệt', value: summary.approved, icon: CheckCircle, color: 'bg-emerald-50', textColor: 'text-emerald-700' },
          { label: 'Từ chối', value: summary.rejected, icon: XCircle, color: 'bg-red-50', textColor: 'text-red-700' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.color} rounded-xl p-4 border border-slate-200`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.textColor}`} />
                <span className="text-sm text-slate-500">{card.label}</span>
              </div>
              <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s ? 'bg-accent-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s === '' ? 'Tất cả' : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nhân viên</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Loại nghỉ</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Từ ngày</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Đến ngày</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Lý do</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Đang tải...</td></tr>
              ) : filteredLeaves.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Chưa có đơn nghỉ phép nào</td></tr>
              ) : (
                filteredLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800">
                        {leave.employees?.first_name} {leave.employees?.last_name}
                      </div>
                      <div className="text-xs text-slate-400">{leave.employees?.employee_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${leaveTypeColors[leave.leave_type] || 'bg-slate-100 text-slate-600'}`}>
                        {leaveTypeLabels[leave.leave_type] || leave.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{leave.start_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{leave.end_date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{leave.reason || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[leave.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabels[leave.status] || leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStatusUpdate(leave.id, 'approved')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Duyệt"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Từ chối"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Tạo đơn nghỉ phép</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nhân viên</label>
                <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                  <option value="">Chọn nhân viên</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Loại nghỉ phép</label>
                <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                  {Object.entries(leaveTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Từ ngày</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Đến ngày</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Lý do</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleSubmit} className="px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-medium transition-colors">Gửi đơn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
