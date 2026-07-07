import { useApp } from '@/lib/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Globe,
  Accessibility,
  Type,
  Wifi,
  Eye,
  Volume2,
  Keyboard,
  Sparkles,
  Check,
} from 'lucide-react';
import type { Language } from '@/lib/types';

export function SettingsPage() {
  const {
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    textScale,
    setTextScale,
    lowBandwidth,
    setLowBandwidth,
    accessibilityMode,
    setAccessibilityMode,
  } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Accessibility & Language Settings</h1>
        <p className="mt-1 text-muted-foreground">Customize Smart Bharat for your needs</p>
      </div>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-accent" /> Language
          </CardTitle>
          <CardDescription>Choose your preferred language for AI responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { value: 'en', label: 'English', desc: 'Default' },
              { value: 'hi', label: 'हिन्दी', desc: 'Hindi (Devanagari)' },
              { value: 'hinglish', label: 'Hinglish', desc: 'Hindi + English mix' },
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value as Language)}
                className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${language === lang.value ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted'}`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-foreground">{lang.label}</span>
                  {language === lang.value && <Check className="h-4 w-4 text-accent" />}
                </div>
                <span className="text-xs text-muted-foreground">{lang.desc}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bharat Accessibility Mode */}
      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-accent" /> Bharat Accessibility Mode
          </CardTitle>
          <CardDescription>One-click mode: large text, simplified interface, voice guidance, reduced visual complexity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="access-mode" className="text-sm font-medium">Enable Bharat Accessibility Mode</Label>
              <p className="text-xs text-muted-foreground">Combines all accessibility features below</p>
            </div>
            <Switch
              id="access-mode"
              checked={accessibilityMode}
              onCheckedChange={(v) => {
                setAccessibilityMode(v);
                if (v) {
                  setHighContrast(true);
                  setTextScale('xl');
                } else {
                  setHighContrast(false);
                  setTextScale('normal');
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4 text-primary" /> Visual Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">High Contrast Mode</Label>
              <p className="text-xs text-muted-foreground">Maximum contrast for better readability</p>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
          <Separator />
          <div>
            <Label className="mb-2 block text-sm font-medium">
              <Type className="mr-1 inline h-4 w-4" /> Text Size
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'normal', label: 'A', size: 'text-sm' },
                { value: 'lg', label: 'A', size: 'text-base' },
                { value: 'xl', label: 'A', size: 'text-lg' },
                { value: '2xl', label: 'A', size: 'text-xl' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTextScale(opt.value as any)}
                  className={`flex h-12 items-center justify-center rounded-lg border font-bold transition-all ${textScale === opt.value ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:bg-muted'}`}
                >
                  <span className={opt.size}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-4 w-4 text-primary" /> Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Low Bandwidth Mode</Label>
              <p className="text-xs text-muted-foreground">Disable animations and heavy effects for slower connections</p>
            </div>
            <Switch checked={lowBandwidth} onCheckedChange={setLowBandwidth} />
          </div>
        </CardContent>
      </Card>

      {/* Features list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accessibility Features</CardTitle>
          <CardDescription>Always available across the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Keyboard, label: 'Keyboard Navigation', desc: 'Full keyboard support' },
              { icon: Volume2, label: 'Voice Input & TTS', desc: 'Speak queries, hear responses' },
              { icon: Eye, label: 'Screen Reader Friendly', desc: 'Semantic HTML, ARIA labels' },
              { icon: Type, label: 'Adjustable Text Size', desc: '4 text size options' },
              { icon: Accessibility, label: 'Large Touch Targets', desc: 'Mobile-first design' },
              { icon: Globe, label: 'Multilingual', desc: 'English, Hindi, Hinglish' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
