import { Calendar, Star } from 'lucide-react';

const holidays = [
  { name: 'Tết Dương lịch', date: '2026-01-01', days: 1, type: 'public' },
  { name: 'Tết Nguyên Đán', date: '2026-02-17', days: 5, type: 'public' },
  { name: 'Ngày Giải phóng miền Nam', date: '2026-04-30', days: 1, type: 'public' },
  { name: 'Ngày Quốc tế Lao động', date: '2026-05-01', days: 1, type: 'public' },
  { name: 'Ngày Quốc khánh', date: '2026-09-02', days: 1, type: 'public' },
  { name: 'Ngày Trung Thu', date: '2026-10-06', days: 1, type: 'company' },
  { name: 'Ngày Phụ nữ Việt Nam', date: '2026-10-20', days: 1, type: 'company' },
  { name: 'Ngày Nhà giáo Việt Nam', date: '2026-11-20', days: 1, type: 'company' },
  { name: 'Giáng sinh', date: '2026-12-25', days: 1, type: 'company' },
];

const typeLabels: Record<string, string> = { public: 'Lễ quốc gia', company: 'Lễ công ty' };
const typeColors: Record<string, string> = { public: 'bg-red-100 text-red-700', company: 'bg-blue-100 text-blue-700' };

export default function HolidaysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ngày lễ</h1>
        <p className="text-slate-500 mt-1">Danh sách ngày lễ và nghỉ phép trong năm</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày lễ</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Số ngày nghỉ</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Loại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.map(h => (
                <tr key={h.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{h.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{h.days} ngày</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[h.type]}`}>
                      {typeLabels[h.type]}
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
