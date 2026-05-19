import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, CheckCircle, XCircle, AlertCircle, CalendarDays, LogIn, LogOut } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string;
  employees: { first_name: string; last_name: string; employee_id: string } | null;
}

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const statusLabels: Record<string, string> = {
  present: 'Có mặt',
  absent: 'Vắng mặt',
  late: 'Đi muộn',
  half_day: 'Nửa ngày',
  on_leave: 'Nghỉ phép',
};

const statusColors: Record<string, string> = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  half_day: 'bg-blue-100 text-blue-700',
  on_leave: 'bg-slate-100 text-slate-600',
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInForm, setCheckInForm] = useState({ employee_id: '', check_in: '08:00', check_out: '17:00', status: 'present', notes: '' });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadEmployees = async () => {
    const { data } = await supabase.from('employees').select('id, first_name, last_name, employee_id').eq('status', 'active').order('first_name');
    setEmployees(data || []);
  };

  const loadAttendance = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('attendance')
      .select('*, employees(first_name, last_name, employee_id)')
      .eq('date', selectedDate)
      .order('check_in', { ascending: true });
    setRecords(data || []);
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!checkInForm.employee_id) return;
    await supabase.from('attendance').insert({
      employee_id: checkInForm.employee_id,
      date: selectedDate,
      check_in: checkInForm.check_in,
      check_out: checkInForm.check_out || null,
      status: checkInForm.status,
      notes: checkInForm.notes,
    });
    setShowCheckIn(false);
    setCheckInForm({ employee_id: '', check_in: '08:00', check_out: '17:00', status: 'present', notes: '' });
    loadAttendance();
  };

  const handleCheckOut = async (id: string) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    await supabase.from('attendance').update({ check_out: time }).eq('id', id);
    loadAttendance();
  };

  const summary = {
    present: records.filter(r => r.status === 'present').length,
    late: records.filter(r => r.status === 'late').length,
    absent: records.filter(r => r.status === 'absent').length,
    on_leave: records.filter(r => r.status === 'on_leave').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chấm công</h1>
          <p className="text-slate-500 mt-1">Theo dõi thời gian làm việc của nhân viên</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none"
          />
          <button
            onClick={() => setShowCheckIn(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Check-in
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Có mặt', value: summary.present, icon: CheckCircle, color: 'bg-emerald-50', textColor: 'text-emerald-700' },
          { label: 'Đi muộn', value: summary.late, icon: AlertCircle, color: 'bg-amber-50', textColor: 'text-amber-700' },
          { label: 'Vắng mặt', value: summary.absent, icon: XCircle, color: 'bg-red-50', textColor: 'text-red-700' },
          { label: 'Nghỉ phép', value: summary.on_leave, icon: CalendarDays, color: 'bg-slate-50', textColor: 'text-slate-700' },
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nhân viên</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Check-in</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Check-out</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Đang tải...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Chưa có dữ liệu chấm công cho ngày này</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800">
                        {record.employees?.first_name} {record.employees?.last_name}
                      </div>
                      <div className="text-xs text-slate-400">{record.employees?.employee_id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm text-slate-600">{record.check_in || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-sm text-slate-600">{record.check_out || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[record.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabels[record.status] || record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!record.check_out && record.check_in && (
                        <button
                          onClick={() => handleCheckOut(record.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 rounded-lg transition-colors"
                        >
                          <LogOut className="w-3 h-3" />
                          Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCheckIn(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Check-in nhân viên</h3>
              <button onClick={() => setShowCheckIn(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nhân viên</label>
                <select value={checkInForm.employee_id} onChange={e => setCheckInForm({ ...checkInForm, employee_id: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                  <option value="">Chọn nhân viên</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giờ vào</label>
                  <input type="time" value={checkInForm.check_in} onChange={e => setCheckInForm({ ...checkInForm, check_in: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Giờ ra</label>
                  <input type="time" value={checkInForm.check_out} onChange={e => setCheckInForm({ ...checkInForm, check_out: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Trạng thái</label>
                <select value={checkInForm.status} onChange={e => setCheckInForm({ ...checkInForm, status: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ghi chú</label>
                <textarea value={checkInForm.notes} onChange={e => setCheckInForm({ ...checkInForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowCheckIn(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleCheckIn} className="px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-medium transition-colors">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
