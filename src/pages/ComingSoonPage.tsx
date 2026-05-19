import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoonPage({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {description && <p className="text-slate-500 mt-1">{description}</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Tinh nang dang phat trien</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Chuc nang nay dang duoc xay dung va se som ra mat. Vui long quay lai sau!
        </p>
      </div>
    </div>
  );
}
