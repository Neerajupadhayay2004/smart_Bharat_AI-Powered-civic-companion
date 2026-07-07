import { useState, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  FileText,
  MapPin,
  TrendingUp,
  Route,
  Settings,
  Shield,
  Home,
  X,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'Bharat AI', icon: MessageSquare },
  { path: '/schemes', label: 'Schemes', icon: Search },
  { path: '/report', label: 'Report Issue', icon: MapPin },
  { path: '/complaints', label: 'My Complaints', icon: FileText },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/journey', label: 'Civic Journey', icon: Route },
  { path: '/impact', label: 'Civic Impact', icon: TrendingUp },
  { path: '/admin', label: 'Admin View', icon: Shield },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isGuest, persona } = useApp();
  const [currentPath, setCurrentPath] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onChange = () => setCurrentPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r bg-card transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <button onClick={() => { navigate('/'); onClose(); }} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bharat-gradient">
              <span className="text-lg font-bold" style={{ color: 'hsl(25 95% 60%)' }}>B</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold leading-tight text-foreground">Smart Bharat</div>
              <div className="text-[10px] text-muted-foreground">AI Civic Companion</div>
            </div>
          </button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t p-4">
          {isGuest ? (
            <div className="rounded-lg bg-success/10 p-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">Demo Mode Active</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {persona ? 'Persona loaded' : 'Guest session'}
              </p>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
