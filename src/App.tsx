import { AppProvider } from '@/lib/app-context';
import { useRoute } from '@/lib/router';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ChatPage } from '@/pages/ChatPage';
import { SchemesPage } from '@/pages/SchemesPage';
import { SchemeDetailPage } from '@/pages/SchemeDetailPage';
import { EligibilityCheckerPage } from '@/pages/EligibilityCheckerPage';
import { ReportIssuePage } from '@/pages/ReportIssuePage';
import { ComplaintsPage } from '@/pages/ComplaintsPage';
import { ComplaintDetailPage } from '@/pages/ComplaintDetailPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { JourneyPage } from '@/pages/JourneyPage';
import { ImpactPage } from '@/pages/ImpactPage';
import { AdminPage } from '@/pages/AdminPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

function Router() {
  const { path } = useRoute();

  const isLanding = path === '/' || path === '';

  if (isLanding) {
    return <LandingPage />;
  }

  const page = (() => {
    switch (true) {
      case path === '/dashboard':
        return <DashboardPage />;
      case path === '/chat':
        return <ChatPage />;
      case path === '/schemes':
        return <SchemesPage />;
      case path.startsWith('/schemes/'):
        return <SchemeDetailPage />;
      case path === '/eligibility':
        return <EligibilityCheckerPage />;
      case path === '/report':
        return <ReportIssuePage />;
      case path === '/complaints':
        return <ComplaintsPage />;
      case path.startsWith('/complaints/'):
        return <ComplaintDetailPage />;
      case path === '/documents':
        return <DocumentsPage />;
      case path === '/journey':
        return <JourneyPage />;
      case path === '/impact':
        return <ImpactPage />;
      case path === '/admin':
        return <AdminPage />;
      case path === '/login' || path === '/register':
        return <LoginPage />;
      case path === '/profile':
        return <ProfilePage />;
      case path === '/settings':
        return <SettingsPage />;
      default:
        return <LandingPage />;
    }
  })();

  return <AppLayout>{page}</AppLayout>;
}

export default function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </AppProvider>
  );
}
