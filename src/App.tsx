import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import OnboardingPage from './pages/OnboardingPage';
import LeavesPage from './pages/LeavesPage';
import AttendancePage from './pages/AttendancePage';
import HolidaysPage from './pages/HolidaysPage';
import PayrollPage from './pages/PayrollPage';
import OnboardingCompletePage from './pages/OnboardingCompletePage';
import CRMDashboardPage from './pages/CRMDashboardPage';
import FinanceDashboardPage from './pages/FinanceDashboardPage';
import ComingSoonPage from './pages/ComingSoonPage';
import NewsPage from './pages/NewsPage';
import TicketsPage from './pages/TicketsPage';
import MeetingRoomsPage from './pages/MeetingRoomsPage';
import Sidebar from './components/Sidebar';
import { useState, useEffect } from 'react';

type Page = 'dashboard' | 'employees' | 'departments' | 'onboarding' | 'leaves' | 'attendance' | 'payroll' | 'holidays'
  | 'crm-dashboard' | 'contacts' | 'deals' | 'finance-dashboard' | 'invoices' | 'expenses' | 'reports'
  | 'news' | 'tickets' | 'ticket-create' | 'meeting-rooms' | 'room-bookings';

function App() {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/onboarding/complete/')) {
      setIsOnboardingComplete(true);
    }
  }, []);

  if (isOnboardingComplete) {
    return <OnboardingCompletePage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Dang tai...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'employees': return <EmployeesPage />;
      case 'departments': return <DepartmentsPage />;
      case 'onboarding': return <OnboardingPage />;
      case 'leaves': return <LeavesPage />;
      case 'attendance': return <AttendancePage />;
      case 'holidays': return <HolidaysPage />;
      case 'payroll': return <PayrollPage />;
      case 'crm-dashboard': return <CRMDashboardPage />;
      case 'contacts': return <ComingSoonPage title="Khach hang" description="Quan ly thong tin khach hang" />;
      case 'deals': return <ComingSoonPage title="Giao dich" description="Theo doi giao dich va hop dong" />;
      case 'finance-dashboard': return <FinanceDashboardPage />;
      case 'invoices': return <ComingSoonPage title="Hoa don" description="Quan ly hoa don va thanh toan" />;
      case 'expenses': return <ComingSoonPage title="Chi phi" description="Theo doi va quan ly chi phi" />;
      case 'reports': return <ComingSoonPage title="Bao cao" description="Bao cao tai chinh va thong ke" />;
      case 'news': return <NewsPage />;
      case 'tickets': return <TicketsPage />;
      case 'ticket-create': return <TicketsPage />;
      case 'meeting-rooms': return <MeetingRoomsPage />;
      case 'room-bookings': return <MeetingRoomsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSignOut={handleSignOut}
        userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
        userEmail={user.email || ''}
      />
      <main className="lg:pl-[260px] pt-16 lg:pt-16 min-h-screen">
        <div className="p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
