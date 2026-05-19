import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, Send, Eye, ChevronRight, UserPlus, Mail, CheckCircle, Clock, FileText, Upload, Trash2 } from 'lucide-react';

interface OnboardingProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  proposed_start_date: string | null;
  salary: number;
  offer_letter_sent: boolean;
  offer_sent_at: string | null;
  status: string;
  token: string;
  created_at: string;
}

const departments = ['Human Resources', 'IT', 'Operations', 'Marketing', 'Finance', 'Design', 'Analytics', 'Product', 'Quality Assurance'];

const statusLabels: Record<string, string> = {
  draft: 'Nháp',
  offer_sent: 'Đã gửi offer',
  candidate_completed: 'Ứng viên hoàn thiện',
  onboarded: 'Đã onboard',
};

const statusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  offer_sent: 'bg-blue-100 text-blue-700',
  candidate_completed: 'bg-accent-100 text-accent-700',
  onboarded: 'bg-emerald-100 text-emerald-700',
};

export default function OnboardingPage() {
  const [profiles, setProfiles] = useState<OnboardingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProfile, setPreviewProfile] = useState<OnboardingProfile | null>(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    department: '', position: '', proposed_start_date: '', salary: 0,
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('onboarding_profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name || !form.email) return;
    await supabase.from('onboarding_profiles').insert({
      ...form,
      status: 'draft',
    });
    setShowCreateModal(false);
    setForm({ first_name: '', last_name: '', email: '', phone: '', department: '', position: '', proposed_start_date: '', salary: 0 });
    loadProfiles();
  };

  const handlePreviewOffer = (profile: OnboardingProfile) => {
    setPreviewProfile(profile);
    setShowPreviewModal(true);
  };

  const handleSendOffer = async (profile: OnboardingProfile) => {
    await supabase.from('onboarding_profiles').update({
      offer_letter_sent: true,
      offer_sent_at: new Date().toISOString(),
      status: 'offer_sent',
    }).eq('id', profile.id);
    setShowPreviewModal(false);
    loadProfiles();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa hồ sơ onboarding này?')) {
      await supabase.from('onboarding_profiles').delete().eq('id', id);
      loadProfiles();
    }
  };

  const summary = {
    total: profiles.length,
    draft: profiles.filter(p => p.status === 'draft').length,
    offerSent: profiles.filter(p => p.status === 'offer_sent').length,
    completed: profiles.filter(p => p.status === 'candidate_completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Onboarding nhân viên</h1>
          <p className="text-slate-500 mt-1">Quy trình tiếp nhận và onboard nhân viên mới</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo hồ sơ onboarding
        </button>
      </div>

      {/* Process steps */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Quy trình Onboarding</h3>
        <div className="flex items-center gap-2">
          {[
            { step: 1, label: 'Tạo hồ sơ (Draft)', icon: UserPlus, color: 'bg-accent-500' },
            { step: 2, label: 'Gửi thư Offer', icon: Send, color: 'bg-blue-500' },
            { step: 3, label: 'Ứng viên hoàn thiện', icon: CheckCircle, color: 'bg-emerald-500' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex items-center gap-2 flex-1">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">Bước {s.step}</div>
                  <div className="text-sm font-medium text-slate-700 truncate">{s.label}</div>
                </div>
                {i < 2 && <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mx-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng hồ sơ', value: summary.total, icon: FileText, color: 'bg-slate-50', textColor: 'text-slate-700' },
          { label: 'Nháp', value: summary.draft, icon: Clock, color: 'bg-slate-50', textColor: 'text-slate-600' },
          { label: 'Đã gửi offer', value: summary.offerSent, icon: Mail, color: 'bg-blue-50', textColor: 'text-blue-700' },
          { label: 'Hoàn thiện', value: summary.completed, icon: CheckCircle, color: 'bg-emerald-50', textColor: 'text-emerald-700' },
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Họ tên</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Phòng ban</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Chức vụ</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày dự kiến</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Đang tải...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Chưa có hồ sơ onboarding nào</td></tr>
              ) : (
                profiles.map(profile => (
                  <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-accent-100 rounded-full flex items-center justify-center text-accent-700 font-semibold text-sm">
                          {profile.first_name[0]}{profile.last_name[0]}
                        </div>
                        <div className="text-sm font-medium text-slate-800">{profile.first_name} {profile.last_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{profile.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{profile.department || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{profile.position || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{profile.proposed_start_date || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[profile.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabels[profile.status] || profile.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {profile.status === 'draft' && (
                          <button
                            onClick={() => handlePreviewOffer(profile)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Xem offer
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(profile.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Bước 1: Tạo hồ sơ nhân viên</h3>
                  <p className="text-xs text-slate-400">Nhập thông tin cơ bản cho ứng viên</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ <span className="text-red-500">*</span></label>
                  <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Nguyễn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên <span className="text-red-500">*</span></label>
                  <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Văn A" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="email@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="0901 234 567" />
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
                  <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Developer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày dự kiến bắt đầu</label>
                  <input type="date" value={form.proposed_start_date} onChange={e => setForm({ ...form, proposed_start_date: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mức lương đề xuất</label>
                  <input type="number" value={form.salary || ''} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="0" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleCreate} className="px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-medium transition-colors">Tạo hồ sơ (Draft)</button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Letter Preview Modal */}
      {showPreviewModal && previewProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Xem trước thư Offer</h3>
                  <p className="text-xs text-slate-400">Kiểm tra nội dung trước khi gửi cho ứng viên</p>
                </div>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              {/* Offer letter content */}
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">H</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">THƯ MỜI NHẬN VIỆC</h2>
                  <p className="text-slate-400 text-sm mt-1">Offer Letter</p>
                </div>

                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <p>
                    Kính gửi <strong>{previewProfile.first_name} {previewProfile.last_name}</strong>,
                  </p>
                  <p>
                    Chúng tôi rất vui mừng thông báo rằng bạn đã được chọn cho vị trí <strong>{previewProfile.position || 'N/A'}</strong> tại phòng <strong>{previewProfile.department || 'N/A'}</strong>.
                  </p>

                  <div className="bg-white rounded-lg p-4 border border-slate-200 my-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Thông tin chi tiết:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400">Vị trí:</span>
                        <div className="font-medium">{previewProfile.position || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Phòng ban:</span>
                        <div className="font-medium">{previewProfile.department || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Ngày bắt đầu:</span>
                        <div className="font-medium">{previewProfile.proposed_start_date || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Mức lương:</span>
                        <div className="font-medium">{previewProfile.salary ? `${Number(previewProfile.salary).toLocaleString('vi-VN')} VNĐ` : 'Thỏa thuận'}</div>
                      </div>
                    </div>
                  </div>

                  <p>
                    Để hoàn thiện hồ sơ nhân viên, vui lòng nhấn vào nút bên dưới để cung cấp thêm thông tin cá nhân, bằng cấp, và tài liệu liên quan.
                  </p>

                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-xl font-medium text-sm">
                      Hoàn thiện hồ sơ nhân viên
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Link: {window.location.origin}/onboarding/complete/{previewProfile.token}
                    </p>
                  </div>

                  <p className="mt-4">
                    Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với phòng Nhân sự qua email hr@company.com.
                  </p>
                  <p className="mt-4">
                    Trân trọng,<br />
                    <strong>Phòng Nhân sự</strong><br />
                    HRM Pro
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowPreviewModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Đóng</button>
              <button
                onClick={() => handleSendOffer(previewProfile)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                Gửi thư Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
