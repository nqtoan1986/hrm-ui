import { Building2, Users, ChevronRight } from 'lucide-react';

const departments = [
  { name: 'Human Resources', headcount: 12, head: 'Nguyễn Thị Lan', color: 'bg-accent-500' },
  { name: 'IT', headcount: 45, head: 'Trần Văn Minh', color: 'bg-blue-500' },
  { name: 'Operations', headcount: 28, head: 'Lê Hoàng Nam', color: 'bg-emerald-500' },
  { name: 'Marketing', headcount: 18, head: 'Phạm Thu Hà', color: 'bg-amber-500' },
  { name: 'Finance', headcount: 15, head: 'Võ Thanh Tùng', color: 'bg-cyan-500' },
  { name: 'Design', headcount: 10, head: 'Đặng Minh Khoa', color: 'bg-rose-500' },
  { name: 'Analytics', headcount: 8, head: 'Ngô Quang Huy', color: 'bg-violet-500' },
  { name: 'Product', headcount: 14, head: 'Huỳnh Thị Mai', color: 'bg-orange-500' },
  { name: 'Quality Assurance', headcount: 9, head: 'Lý Văn Đức', color: 'bg-slate-500' },
];

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Phòng ban</h1>
        <p className="text-slate-500 mt-1">Danh sách các phòng ban trong công ty</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map(dept => (
          <div key={dept.name} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${dept.color} rounded-xl flex items-center justify-center`}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{dept.name}</h3>
            <p className="text-sm text-slate-500 mb-4">Trưởng phòng: {dept.head}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Users className="w-4 h-4" />
              <span>{dept.headcount} nhân viên</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
