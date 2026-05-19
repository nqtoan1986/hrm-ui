import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Upload, Plus, Trash2, User, GraduationCap, Phone, Camera, FileText, ChevronRight } from 'lucide-react';

interface OnboardingProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  city: string;
  country: string;
  id_number: string;
  tax_number: string;
  bank_account: string;
  status: string;
  token: string;
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  gpa: string;
}

interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

interface Document {
  id?: string;
  doc_type: string;
  file_url: string;
  file_name: string;
}

const STEPS = [
  { id: 1, label: 'Thông tin cá nhân', icon: User },
  { id: 2, label: 'Học vấn & Bằng cấp', icon: GraduationCap },
  { id: 3, label: 'Liên hệ khẩn cấp', icon: Phone },
  { id: 4, label: 'Tài liệu & Ảnh', icon: Camera },
];

export default function OnboardingCompletePage() {
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const [personalForm, setPersonalForm] = useState({
    date_of_birth: '', gender: '', address: '', city: '', country: '',
    id_number: '', tax_number: '', bank_account: '',
  });

  const [educationList, setEducationList] = useState<Education[]>([
    { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' },
  ]);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '', email: '', address: '' },
  ]);

  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/');
    const t = parts[parts.length - 1];
    setToken(t);
  }, []);

  useEffect(() => {
    if (token) loadProfile();
  }, [token]);

  const loadProfile = async () => {
    const { data } = await supabase.from('onboarding_profiles').select('*').eq('token', token).maybeSingle();
    if (data) {
      setProfile(data);
      setPersonalForm({
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        id_number: data.id_number || '',
        tax_number: data.tax_number || '',
        bank_account: data.bank_account || '',
      });
      // Load existing education, contacts, documents
      const [eduRes, contactRes, docRes] = await Promise.all([
        supabase.from('onboarding_education').select('*').eq('onboarding_id', data.id),
        supabase.from('onboarding_emergency_contacts').select('*').eq('onboarding_id', data.id),
        supabase.from('onboarding_documents').select('*').eq('onboarding_id', data.id),
      ]);
      if (eduRes.data && eduRes.data.length > 0) setEducationList(eduRes.data);
      if (contactRes.data && contactRes.data.length > 0) setEmergencyContacts(contactRes.data);
      if (docRes.data) setDocuments(docRes.data);

      if (data.status === 'candidate_completed' || data.status === 'onboarded') {
        setCompleted(true);
      }
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(docType);
    const fileExt = file.name.split('.').pop();
    const filePath = `onboarding/${profile.id}/${docType}_${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      const newDoc = { doc_type: docType, file_url: urlData.publicUrl, file_name: file.name };

      // Save to DB
      await supabase.from('onboarding_documents').insert({
        onboarding_id: profile.id,
        ...newDoc,
      });

      setDocuments(prev => [...prev, newDoc]);
    }
    setUploading(null);
  };

  const saveStep1 = async () => {
    if (!profile) return;
    await supabase.from('onboarding_profiles').update(personalForm).eq('id', profile.id);
  };

  const saveStep2 = async () => {
    if (!profile) return;
    // Delete existing and re-insert
    await supabase.from('onboarding_education').delete().eq('onboarding_id', profile.id);
    const records = educationList.filter(e => e.institution || e.degree);
    if (records.length > 0) {
      await supabase.from('onboarding_education').insert(records.map(e => ({
        onboarding_id: profile.id,
        institution: e.institution,
        degree: e.degree,
        field_of_study: e.field_of_study,
        start_date: e.start_date || null,
        end_date: e.end_date || null,
        gpa: e.gpa,
      })));
    }
  };

  const saveStep3 = async () => {
    if (!profile) return;
    await supabase.from('onboarding_emergency_contacts').delete().eq('onboarding_id', profile.id);
    const records = emergencyContacts.filter(c => c.name || c.phone);
    if (records.length > 0) {
      await supabase.from('onboarding_emergency_contacts').insert(records.map(c => ({
        onboarding_id: profile.id,
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        email: c.email,
        address: c.address,
      })));
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) await saveStep1();
    if (currentStep === 2) await saveStep2();
    if (currentStep === 3) await saveStep3();
    setCurrentStep(s => Math.min(4, s + 1));
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setSubmitting(true);
    await supabase.from('onboarding_profiles').update({
      status: 'candidate_completed',
      completed_at: new Date().toISOString(),
    }).eq('id', profile.id);
    setCompleted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Liên kết không hợp lệ</h2>
          <p className="text-slate-500">Liên kết hoàn thiện hồ sơ không tồn tại hoặc đã hết hạn.</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-slate-200">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Hoàn tất hồ sơ!</h2>
          <p className="text-slate-500">Cảm ơn bạn đã hoàn thiện hồ sơ. Phòng Nhân sự sẽ liên hệ với bạn sớm.</p>
        </div>
      </div>
    );
  }

  const docTypes = [
    { key: 'id_front', label: 'CCCD mặt trước', icon: FileText },
    { key: 'id_back', label: 'CCCD mặt sau', icon: FileText },
    { key: 'portrait', label: 'Ảnh chân dung', icon: Camera },
    { key: 'degree', label: 'Bằng cấp liên quan', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">HRM Pro</span>
              <span className="text-slate-400 text-sm ml-2">Hoàn thiện hồ sơ</span>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {profile.first_name} {profile.last_name}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step indicator */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDone ? 'bg-emerald-500' : isActive ? 'bg-accent-500' : 'bg-slate-200'
                    }`}>
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      )}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-accent-700' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 mx-2 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Thông tin cá nhân</h3>
                <p className="text-sm text-slate-400">Vui lòng cung cấp thông tin cá nhân của bạn</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Ngày sinh</label>
                    <input type="date" value={personalForm.date_of_birth} onChange={e => setPersonalForm({ ...personalForm, date_of_birth: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Giới tính</label>
                    <select value={personalForm.gender} onChange={e => setPersonalForm({ ...personalForm, gender: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ</label>
                  <input value={personalForm.address} onChange={e => setPersonalForm({ ...personalForm, address: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Số nhà, tên đường" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Thành phố</label>
                    <input value={personalForm.city} onChange={e => setPersonalForm({ ...personalForm, city: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="TP. Hồ Chí Minh" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Quốc gia</label>
                    <input value={personalForm.country} onChange={e => setPersonalForm({ ...personalForm, country: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Việt Nam" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Số CCCD</label>
                  <input value={personalForm.id_number} onChange={e => setPersonalForm({ ...personalForm, id_number: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="001234567890" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Mã số thuế</label>
                    <input value={personalForm.tax_number} onChange={e => setPersonalForm({ ...personalForm, tax_number: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tài khoản ngân hàng</label>
                    <input value={personalForm.bank_account} onChange={e => setPersonalForm({ ...personalForm, bank_account: e.target.value })} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {currentStep === 2 && (
            <div>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Học vấn & Bằng cấp</h3>
                <p className="text-sm text-slate-400">Thêm thông tin học vấn và bằng cấp của bạn</p>
              </div>
              <div className="px-6 py-5 space-y-6">
                {educationList.map((edu, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 relative">
                    {educationList.length > 1 && (
                      <button
                        onClick={() => setEducationList(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="text-sm font-medium text-slate-700 mb-3">Bằng cấp #{idx + 1}</div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Trường / Cơ sở đào tạo</label>
                        <input value={edu.institution} onChange={e => {
                          const updated = [...educationList];
                          updated[idx] = { ...updated[idx], institution: e.target.value };
                          setEducationList(updated);
                        }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Đại học ABC" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bằng cấp</label>
                          <input value={edu.degree} onChange={e => {
                            const updated = [...educationList];
                            updated[idx] = { ...updated[idx], degree: e.target.value };
                            setEducationList(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Cử nhân" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Chuyên ngành</label>
                          <input value={edu.field_of_study} onChange={e => {
                            const updated = [...educationList];
                            updated[idx] = { ...updated[idx], field_of_study: e.target.value };
                            setEducationList(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Khoa học máy tính" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Từ</label>
                          <input type="date" value={edu.start_date} onChange={e => {
                            const updated = [...educationList];
                            updated[idx] = { ...updated[idx], start_date: e.target.value };
                            setEducationList(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Đến</label>
                          <input type="date" value={edu.end_date} onChange={e => {
                            const updated = [...educationList];
                            updated[idx] = { ...updated[idx], end_date: e.target.value };
                            setEducationList(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">GPA</label>
                          <input value={edu.gpa} onChange={e => {
                            const updated = [...educationList];
                            updated[idx] = { ...updated[idx], gpa: e.target.value };
                            setEducationList(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="3.5/4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setEducationList(prev => [...prev, { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' }])}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-accent-300 hover:text-accent-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm bằng cấp
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contacts */}
          {currentStep === 3 && (
            <div>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Người liên hệ khẩn cấp</h3>
                <p className="text-sm text-slate-400">Thông tin người có thể liên hệ trong trường hợp khẩn cấp</p>
              </div>
              <div className="px-6 py-5 space-y-6">
                {emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 relative">
                    {emergencyContacts.length > 1 && (
                      <button
                        onClick={() => setEmergencyContacts(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="text-sm font-medium text-slate-700 mb-3">Người liên hệ #{idx + 1}</div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ tên</label>
                          <input value={contact.name} onChange={e => {
                            const updated = [...emergencyContacts];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setEmergencyContacts(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Nguyễn Văn B" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mối quan hệ</label>
                          <select value={contact.relationship} onChange={e => {
                            const updated = [...emergencyContacts];
                            updated[idx] = { ...updated[idx], relationship: e.target.value };
                            setEmergencyContacts(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none">
                            <option value="">Chọn mối quan hệ</option>
                            <option value="spouse">Vợ/Chồng</option>
                            <option value="parent">Cha/Mẹ</option>
                            <option value="sibling">Anh/Chị/Em</option>
                            <option value="friend">Bạn bè</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                          <input value={contact.phone} onChange={e => {
                            const updated = [...emergencyContacts];
                            updated[idx] = { ...updated[idx], phone: e.target.value };
                            setEmergencyContacts(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="0901 234 567" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                          <input type="email" value={contact.email} onChange={e => {
                            const updated = [...emergencyContacts];
                            updated[idx] = { ...updated[idx], email: e.target.value };
                            setEmergencyContacts(updated);
                          }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="email@example.com" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ</label>
                        <input value={contact.address} onChange={e => {
                          const updated = [...emergencyContacts];
                          updated[idx] = { ...updated[idx], address: e.target.value };
                          setEmergencyContacts(updated);
                        }} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 outline-none" placeholder="Địa chỉ liên hệ" />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setEmergencyContacts(prev => [...prev, { name: '', relationship: '', phone: '', email: '', address: '' }])}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-accent-300 hover:text-accent-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm người liên hệ
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Documents & Photos */}
          {currentStep === 4 && (
            <div>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Tài liệu & Ảnh</h3>
                <p className="text-sm text-slate-400">Tải lên CCCD 2 mặt, bằng cấp, và ảnh chân dung làm thẻ nhân viên</p>
              </div>
              <div className="px-6 py-5 space-y-6">
                {docTypes.map(docType => {
                  const Icon = docType.icon;
                  const existingDoc = documents.find(d => d.doc_type === docType.key);
                  return (
                    <div key={docType.key} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-accent-600" />
                          <span className="text-sm font-medium text-slate-700">{docType.label}</span>
                        </div>
                        {existingDoc && (
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Đã tải lên</span>
                        )}
                      </div>
                      {existingDoc ? (
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-700 truncate">{existingDoc.file_name}</div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-accent-300 hover:bg-accent-50/30 transition-colors">
                          {uploading === docType.key ? (
                            <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-slate-400 mb-2" />
                              <span className="text-sm text-slate-500">Nhấn để tải lên</span>
                              <span className="text-xs text-slate-400 mt-1">JPG, PNG, PDF (tối đa 5MB)</span>
                            </>
                          )}
                          <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileUpload(e, docType.key)} />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(s => s - 1)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Quay lại
              </button>
            ) : (
              <div />
            )}
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Hoàn tất hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
