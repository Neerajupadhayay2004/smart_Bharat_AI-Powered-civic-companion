import { Menu, Globe, Mic, Accessibility, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { LANGUAGE_NAMES, type Language } from '@/lib/i18n';

const LANGUAGES = Object.keys(LANGUAGE_NAMES) as Language[];

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { language, setLanguage, setCopilotOpen, accessibilityMode, setAccessibilityMode } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bharat-gradient">
            <span className="text-sm font-bold" style={{ color: 'hsl(25 95% 60%)' }}>B</span>
          </div>
          <span className="font-bold text-foreground">Smart Bharat</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-primary"
          onClick={() => setCopilotOpen(true)}
        >
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">Ask Bharat AI</span>
          <span className="sm:hidden">Ask AI</span>
        </Button>

        <Button
          variant={accessibilityMode ? 'default' : 'ghost'}
          size="icon"
          onClick={() => {
            setAccessibilityMode(!accessibilityMode);
            navigate('/settings');
          }}
          aria-label="Accessibility settings"
        >
          <Accessibility className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Select language">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[60vh] overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
                className={language === lang ? 'font-semibold' : ''}
              >
                {language === lang ? '✓ ' : ''}
                {LANGUAGE_NAMES[lang]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
