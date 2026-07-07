import { useState, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { DEMO_PERSONAS } from '@/lib/seed-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Mic,
  Search,
  FileText,
  MapPin,
  Route,
  TrendingUp,
  Shield,
  Globe,
  Accessibility,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Languages,
  Zap,
} from 'lucide-react';

export function LandingPage() {
  const { setCopilotOpen, setPersona } = useApp();
  const [stats, setStats] = useState({ schemes: 0, citizens: 0, complaints: 0, languages: 0 });

  useEffect(() => {
    const targets = { schemes: 15, citizens: 24000, complaints: 8600, languages: 3 };
    const interval = setInterval(() => {
      setStats((prev) => ({
        schemes: Math.min(prev.schemes + 1, targets.schemes),
        citizens: Math.min(prev.citizens + 200, targets.citizens),
        complaints: Math.min(prev.complaints + 80, targets.complaints),
        languages: Math.min(prev.languages + 1, targets.languages),
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handlePersona = (id: string) => {
    setPersona(id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bharat-gradient">
              <span className="text-lg font-bold" style={{ color: 'hsl(25 95% 60%)' }}>B</span>
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Smart Bharat</div>
              <div className="text-[10px] text-muted-foreground">AI Civic Companion</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => navigate('/dashboard')}>
              Try Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bharat-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 border-accent/30 bg-accent/5 text-accent">
              <Sparkles className="h-3 w-3" />
              AI-Powered Civic Technology
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Government Services.
              <br />
              <span className="bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent">
                Simplified by AI.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Discover schemes, understand eligibility, prepare documents, report civic issues, and get trusted guidance in your language.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="gap-2 bg-accent px-8 hover:bg-accent/90"
                onClick={() => setCopilotOpen(true)}
              >
                <Mic className="h-5 w-5" />
                Ask Bharat AI
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8"
                onClick={() => navigate('/schemes')}
              >
                <Search className="h-5 w-5" />
                Explore Services
              </Button>
            </div>

            {/* Voice query bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-lg">
                <button
                  onClick={() => setCopilotOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors hover:bg-accent/20"
                  aria-label="Voice query"
                >
                  <Mic className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Ask: 'I'm a student from Bihar, which scholarships can I get?'"
                  className="flex-1 bg-transparent px-2 text-sm focus:outline-none"
                  onFocus={() => setCopilotOpen(true)}
                  readOnly
                />
                <Button size="sm" className="shrink-0" onClick={() => setCopilotOpen(true)}>
                  Ask
                </Button>
              </div>
            </div>
          </div>

          {/* Live stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Government Schemes', value: stats.schemes, icon: Shield, suffix: '+' },
              { label: 'Citizens Helped', value: stats.citizens.toLocaleString(), icon: Users, suffix: '+' },
              { label: 'Issues Resolved', value: stats.complaints.toLocaleString(), icon: CheckCircle2, suffix: '+' },
              { label: 'Languages', value: stats.languages, icon: Languages, suffix: '' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
                  <Icon className="mx-auto h-5 w-5 text-accent" />
                  <div className="mt-2 text-2xl font-bold text-foreground">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Personas */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <Badge variant="outline" className="mb-3 gap-1.5">
              <Zap className="h-3 w-3" />
              One-Click Demo
            </Badge>
            <h2 className="text-3xl font-bold text-foreground">Try a Demo Persona</h2>
            <p className="mt-2 text-muted-foreground">
              Experience a complete AI-assisted civic workflow. Pick a persona to start.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {DEMO_PERSONAS.map((persona) => (
              <Card
                key={persona.id}
                className="group cursor-pointer border-2 transition-all hover:border-accent hover:shadow-lg"
                onClick={() => handlePersona(persona.id)}
              >
              <CardHeader>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${persona.color} text-2xl`}>
                  {persona.avatar}
                </div>
                <CardTitle className="mt-3">{persona.name}</CardTitle>
                <Badge variant="secondary" className="w-fit">{persona.role} · {persona.state}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{persona.description}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
                  Start demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground">Everything a citizen needs, powered by AI</h2>
            <p className="mt-2 text-muted-foreground">Not just another chatbot — an AI Civic Action Agent.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Sparkles, title: 'Bharat AI Copilot', desc: 'Multilingual AI assistant with RAG-powered, source-backed answers. Never hallucinates government details.', color: 'text-accent' },
              { icon: Search, title: 'Scheme Discovery Engine', desc: 'AI ranks schemes by your profile. Shows eligibility match, missing info, and next actions.', color: 'text-blue-500' },
              { icon: MapPin, title: 'Civic Issue Reporter', desc: 'Report garbage, potholes, water issues with photo + AI-generated complaint + tracking ticket.', color: 'text-success' },
              { icon: FileText, title: 'Document Assistant', desc: 'Privacy-first document readiness check. AI classifies, extracts, and scores your documents.', color: 'text-purple-500' },
              { icon: Route, title: 'Civic Journey Timeline', desc: 'Your complete civic story — schemes discovered, documents prepared, complaints tracked.', color: 'text-orange-500' },
              { icon: Shield, title: 'AI Transparency Layer', desc: 'Every answer shows sources, confidence, and how AI reached its conclusion.', color: 'text-teal-500' },
              { icon: TrendingUp, title: 'Civic Impact Dashboard', desc: 'Citizen metrics + admin analytics with AI Civic Pulse summarizing public problems.', color: 'text-indigo-500' },
              { icon: Globe, title: 'Multilingual Bharat Mode', desc: 'English, Hindi, Hinglish. Auto-detection, voice input, text-to-speech, simple-language mode.', color: 'text-pink-500' },
              { icon: Accessibility, title: 'Accessibility & Inclusion', desc: 'High-contrast, adjustable text, voice guidance, keyboard nav, Bharat Accessibility Mode.', color: 'text-cyan-500' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="transition-all hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="border-t bg-primary py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Shield className="h-10 w-10" style={{ color: 'hsl(25 95% 60%)' }} />
              <h3 className="mt-4 text-2xl font-bold">Responsible AI, built for trust</h3>
              <p className="mt-2 text-white/70">
                Every government answer is backed by official sources with verification dates. The AI never invents scheme details — it uses Retrieval-Augmented Generation over a verified knowledge base.
              </p>
              <div className="mt-4 space-y-2">
                {['Source citations on every answer', 'Confidence scoring', 'AI transparency panel', 'Guardrails against hallucination'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Building2 className="h-10 w-10" style={{ color: 'hsl(25 95% 60%)' }} />
              <h3 className="mt-4 text-2xl font-bold">Built for every Indian citizen</h3>
              <p className="mt-2 text-white/70">
                From students to farmers, senior citizens to women entrepreneurs — Smart Bharat serves all. Accessible, multilingual, and designed for low digital literacy.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Students', value: 'Scholarships' },
                  { label: 'Farmers', value: 'PM-KISAN, Insurance' },
                  { label: 'Senior Citizens', value: 'Pensions' },
                  { label: 'Women', value: 'Welfare & Enterprise' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white/10 p-3">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-white/60">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground">Ready to experience Smart Bharat?</h2>
          <p className="mt-2 text-muted-foreground">Start with a demo persona or ask Bharat AI directly.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 bg-accent px-8 hover:bg-accent/90" onClick={() => navigate('/dashboard')}>
              Enter Dashboard <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8" onClick={() => setCopilotOpen(true)}>
              <Sparkles className="h-5 w-5" /> Talk to AI
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bharat-gradient">
                <span className="text-sm font-bold" style={{ color: 'hsl(25 95% 60%)' }}>B</span>
              </div>
              <span className="text-sm font-semibold">Smart Bharat</span>
            </div>
            <p className="text-xs text-muted-foreground">
              AI-Powered Civic Companion · Hackathon Prototype · Demo data for illustration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
