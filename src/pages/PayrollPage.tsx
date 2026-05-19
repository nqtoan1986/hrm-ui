import { DollarSign, TrendingUp, Download, FileText } from 'lucide-react';

const payrollData = [
  { id: 'PY-2026-001', name: 'Nguyễn Văn A', department: 'IT', position: 'Senior Developer', baseSalary: '25,000,000', allowance: '3,000,000', deduction: '2,500,000', net: '25,500,000', status: 'paid' },
  { id: 'PY-2026-002', name: 'Trần Thị B', department: 'Marketing', position: 'Marketing Lead', baseSalary: '22,000,000', allowance: '2,500,000', deduction: '2,200,000', net: '22,300,000', status: 'paid' },
  { id: 'PY-2026-003', name: 'Lê Hoàng C', department: 'Finance', position: 'Accountant', baseSalary: '18,000,000', allowance: '1,500,000', deduction: '1,800,000', net: '17,700,000', status: 'pending' },
  { id: 'PY-2026-004', name: 'Phạm Minh D', department: 'Operations', position: 'Ops Manager', baseSalary: '28,000,000', allowance: '4,000,000', deduction: '2,800,000', net: '29,200,000', status: 'pending' },
  { id: 'PY-2026-005', name: 'Võ Thu E', department: 'Design', position: 'UI Designer', baseSalary: '20,000,000', allowance: '2,000,000', deduction: '2,000,000', net: '20,000,000', status: 'paid' },
];

const statusLabels: Record<string, string> = { paid: 'Đã trả', pending: 'Chờ xử lý' };
const statusColors: Record<string, string> = { paid: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700' };

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bảng lương</h1>
          <p className="text-slate-500 mt-1">Quản lý lương và phụ cấp nhân viên</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Xuất bảng lương
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-600" />
            </div>
            <span className="text-sm text-slate-500">Tổng quỹ lương</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">1,147,000,000</div>
          <div className="text-xs text-slate-400">VNĐ / tháng</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500">Lương trung bình</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">22,940,000</div>
          <div className="text-xs text-slate-400">VNĐ / nhân viên</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">Phiếu lương</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">50</div>
          <div className="text-xs text-slate-400">Tháng 05/2026</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Mã</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nhân viên</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Phòng ban</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Lương cơ bản</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Phụ cấp</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Khấu trừ</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Thực lĩnh</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollData.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{row.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right">{row.baseSalary}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-right">+{row.allowance}</td>
                  <td className="px-6 py-4 text-sm text-red-600 text-right">-{row.deduction}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800 text-right">{row.net}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[row.status]}`}>
                      {statusLabels[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
