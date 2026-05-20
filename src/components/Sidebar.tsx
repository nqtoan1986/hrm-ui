import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, Users, UserPlus, FileText, Clock, Calendar,
  DollarSign, Building2, ChevronDown, ChevronRight,
  LogOut, Menu, X, Bell, Search, User, Briefcase,
  BarChart3, PieChart, Receipt, CreditCard, BookOpen,
  Settings, HelpCircle, Globe, Newspaper, Ticket, Send,
  DoorOpen, CalendarCheck, MessageSquare, Plus, ChevronUp
} from 'lucide-react';

type Page = 'dashboard' | 'employees' | 'departments' | 'onboarding' | 'leaves' | 'attendance' | 'payroll' | 'holidays'
  | 'crm-dashboard' | 'contacts' | 'deals' | 'finance-dashboard' | 'invoices' | 'expenses' | 'reports'
  | 'news' | 'tickets' | 'ticket-create' | 'meeting-rooms' | 'room-bookings' | 'room-manage' | 'room-bookings-history';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
  userName: string;
  userEmail: string;
}

const menuStructure = [
  {
    group: 'Tong quan',
    items: [
      { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'HRM',
    icon: Users,
    color: '#5b9bd5',
    items: [
      { id: 'employees' as Page, label: 'Nhan vien', icon: Users },
      { id: 'departments' as Page, label: 'Phong ban', icon: Building2 },
      { id: 'onboarding' as Page, label: 'Onboarding', icon: UserPlus },
      { id: 'leaves' as Page, label: 'Xin nghi phep', icon: FileText },
      { id: 'attendance' as Page, label: 'Cham cong', icon: Clock },
      { id: 'holidays' as Page, label: 'Ngay le', icon: Calendar },
      { id: 'payroll' as Page, label: 'Bang luong', icon: DollarSign },
    ],
  },
  {
    group: 'CRM',
    icon: Briefcase,
    color: '#3BB54A',
    items: [
      { id: 'crm-dashboard' as Page, label: 'Tong quan CRM', icon: BarChart3 },
      { id: 'contacts' as Page, label: 'Khach hang', icon: Globe },
      { id: 'deals' as Page, label: 'Giao dich', icon: PieChart },
    ],
  },
  {
    group: 'Finance',
    icon: Receipt,
    color: '#E41E25',
    items: [
      { id: 'finance-dashboard' as Page, label: 'Tong quan TC', icon: BarChart3 },
      { id: 'invoices' as Page, label: 'Hoa don', icon: CreditCard },
      { id: 'expenses' as Page, label: 'Chi phi', icon: Receipt },
      { id: 'reports' as Page, label: 'Bao cao', icon: BookOpen },
    ],
  },
  {
    group: 'Cong cu',
    icon: Settings,
    items: [
      { id: 'news' as Page, label: 'Tin tuc noi bo', icon: Newspaper },
      { id: 'tickets' as Page, label: 'Ticket System', icon: Ticket },
      { id: 'meeting-rooms' as Page, label: 'Phong hop', icon: DoorOpen, submenu: [
        { id: 'room-bookings' as Page, label: 'Dat phong hop' },
        { id: 'room-manage' as Page, label: 'Quan ly phong' },
        { id: 'room-bookings-history' as Page, label: 'Lich su dat phong' },
      ]},
    ],
  },
];

const bottomItems = [
  { id: 'settings' as const, label: 'Cai dat', icon: Settings },
  { id: 'help' as const, label: 'Tro giup', icon: HelpCircle },
];

const groupColors: Record<string, string> = {
  'HRM': '#5b9bd5',
  'CRM': '#3BB54A',
  'Finance': '#E41E25',
};

export default function Sidebar({ currentPage, onNavigate, onSignOut, userName, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Tong quan', 'HRM', 'Cong cu']);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const isGroupActive = (group: string) => {
    const section = menuStructure.find(s => s.group === group);
    if (!section) return false;
    return section.items.some(item => item.id === currentPage);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
        <img src="/mcv-logo.svg" alt="MCV" className="h-7 flex-shrink-0" />
        {!collapsed && (
          <div className="ml-1">
            <span className="text-white text-sm font-bold tracking-tight block leading-tight">MCV Group</span>
            <span className="text-slate-500 text-[10px] leading-tight">Internal Portal</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {menuStructure.map((section) => {
          const isExpanded = expandedGroups.includes(section.group);
          const isActive = isGroupActive(section.group);
          const groupColor = groupColors[section.group];

          return (
            <div key={section.group}>
              {/* Group header */}
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(section.group)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all ${
                    isActive ? 'text-slate-200' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {groupColor ? (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: groupColor }} />
                    ) : (
                      <Layers className="w-3 h-3 text-slate-500" />
                    )}
                    <span>{section.group}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}

              {/* Collapsed group icon */}
              {collapsed && section.icon && (
                <button
                  onClick={() => toggleGroup(section.group)}
                  className={`w-full flex items-center justify-center py-2.5 my-0.5 rounded-lg transition-all ${
                    isActive ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                  }`}
                  title={section.group}
                >
                  <div className="relative">
                    <section.icon className="w-5 h-5" />
                    {groupColor && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: groupColor }} />
                    )}
                  </div>
                </button>
              )}

              {/* Group items */}
              {(isExpanded || collapsed) && (
                <div className={`space-y-0.5 ${collapsed ? '' : 'mt-0.5'}`}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const itemActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          itemActive
                            ? 'bg-white/[0.08] text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/[0.06] px-3 py-2 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all"
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30">
        <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/mcv-logo.svg" alt="MCV" className="h-7" />
          <div>
            <span className="font-bold text-slate-800 text-sm">MCV Group</span>
          </div>
        </div>
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#0c1222] transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <img src="/mcv-logo.svg" alt="MCV" className="h-7" />
            <div>
              <span className="text-white text-sm font-bold">MCV Group</span>
              <span className="text-slate-500 text-[10px] block leading-tight">Internal Portal</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-[#0c1222] border-r border-white/[0.06] transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}>
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1e3a5f] border border-[#2a4a7a] rounded-full flex items-center justify-center text-slate-300 hover:bg-[#2a4a7a] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Top bar for desktop */}
      <div className={`hidden lg:flex fixed top-0 right-0 h-16 bg-white border-b border-slate-200 items-center justify-between px-6 z-20 transition-all duration-300 ${collapsed ? 'left-[68px]' : 'left-[260px]'}`}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tim kiem..."
              className="pl-10 pr-4 py-2 w-72 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f]/15 focus:border-[#1e3a5f] outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <UserMenu userName={userName} userEmail={userEmail} onSignOut={onSignOut} />
        </div>
      </div>
    </>
  );
}

function UserMenu({ userName, userEmail, onSignOut }: { userName: string; userEmail: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 pl-4 border-l border-slate-200 py-1 transition-colors"
      >
        <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-slate-300" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-slate-700">{userName}</div>
          <div className="text-[11px] text-slate-400">{userEmail}</div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-800">{userName}</div>
            <div className="text-xs text-slate-400 mt-0.5">{userEmail}</div>
          </div>
          <div className="py-1">
            {[
              { icon: User, label: 'Ho so ca nhan' },
              { icon: Settings, label: 'Cai dat tai khoan' },
              { icon: Bell, label: 'Thong bao' },
              { icon: HelpCircle, label: 'Tro giup' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Dang xuat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Layers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    </svg>
  );
}
