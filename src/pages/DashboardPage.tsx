import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, FileText, Clock, TrendingUp, TrendingDown, Calendar, CheckCircle } from 'lucide-react';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  presentToday: number;
  onboardingCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    presentToday: 0,
    onboardingCount: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [recentOnboarding, setRecentOnboarding] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [empRes, activeRes, leaveRes, attendRes, onboardRes, recentLeaveRes, recentOnboardRes] = await Promise.all([
      supabase.from('employees').select('id', { count: 'exact', head: true }),
      supabase.from('employees').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', new Date().toISOString().split('T')[0]).eq('status', 'present'),
      supabase.from('onboarding_profiles').select('id', { count: 'exact', head: true }).in('status', ['draft', 'offer_sent']),
      supabase.from('leave_requests').select('id, leave_type, start_date, end_date, status, employees(first_name, last_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('onboarding_profiles').select('id, first_name, last_name, email, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      totalEmployees: empRes.count || 0,
      activeEmployees: activeRes.count || 0,
      pendingLeaves: leaveRes.count || 0,
      presentToday: attendRes.count || 0,
      onboardingCount: onboardRes.count || 0,
    });
    setRecentLeaves(recentLeaveRes.data || []);
    setRecentOnboarding(recentOnboardRes.data || []);
  };

  const statCards = [
    { label: 'Tổng nhân viên', value: stats.totalEmployees, icon: Users, color: 'bg-accent-500', lightColor: 'bg-accent-50', textColor: 'text-accent-600', trend: '+12%', up: true },
    { label: 'Đang làm việc', value: stats.activeEmployees, icon: CheckCircle, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600', trend: '+5%', up: true },
    { label: 'Nghỉ phép chờ duyệt', value: stats.pendingLeaves, icon: FileText, color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-600', trend: '-3%', up: false },
    { label: 'Có mặt hôm nay', value: stats.presentToday, icon: Clock, color: 'bg-cyan-500', lightColor: 'bg-cyan-50', textColor: 'text-cyan-600', trend: '+2%', up: true },
  ];

  const statusLabels: Record<string, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    draft: 'Nháp',
    offer_sent: 'Đã gửi offer',
    candidate_completed: 'Hoàn thiện',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-700',
    offer_sent: 'bg-blue-100 text-blue-700',
    candidate_completed: 'bg-accent-100 text-accent-700',
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Tổng quan hệ thống quản lý nhân sự</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.lightColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                {card.up ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>{card.trend}</span>
                <span className="text-sm text-slate-400 ml-1">so với tháng trước</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leave requests */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Đơn nghỉ phép gần đây</h2>
            <span className="text-xs text-slate-400">{recentLeaves.length} đơn</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLeaves.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">Chưa có đơn nghỉ phép nào</div>
            ) : (
              recentLeaves.map((leave) => (
                <div key={leave.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {leave.employees?.first_name} {leave.employees?.last_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {leave.start_date} - {leave.end_date}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[leave.status] || 'bg-slate-100 text-slate-600'}`}>
                    {statusLabels[leave.status] || leave.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent onboarding */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Onboarding gần đây</h2>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-accent-600">{stats.onboardingCount} đang xử lý</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOnboarding.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">Chưa có hồ sơ onboarding nào</div>
            ) : (
              recentOnboarding.map((profile) => (
                <div key={profile.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-4 h-4 text-accent-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {profile.first_name} {profile.last_name}
                      </div>
                      <div className="text-xs text-slate-400">{profile.email}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[profile.status] || 'bg-slate-100 text-slate-600'}`}>
                    {statusLabels[profile.status] || profile.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
