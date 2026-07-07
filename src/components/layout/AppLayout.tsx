import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AICopilot } from './AICopilot';
import { VoiceAssistant } from './VoiceAssistant';
import { useApp } from '@/lib/app-context';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { copilotOpen } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <AICopilot />
      <VoiceAssistant />
      {copilotOpen && <div className="hidden" />}
    </div>
  );
}
