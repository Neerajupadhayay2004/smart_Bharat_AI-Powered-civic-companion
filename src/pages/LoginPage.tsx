import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { DEMO_PERSONAS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { setPersona, setProfile } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = () => {
    setProfile({ state: 'Delhi', location: 'urban' });
    navigate('/dashboard');
  };

  const handlePersona = (id: string) => {
    setPersona(id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background bharat-pattern">
      <div className="absolute left-4 top-4">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" /> Home
        </Button>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bharat-gradient">
              <span className="text-xl font-bold" style={{ color: 'hsl(25 95% 60%)' }}>B</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">Welcome to Smart Bharat</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in or try a demo persona</p>
          </div>

          <Tabs defaultValue="demo" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="demo">Try Demo</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="demo" className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-accent" /> Demo Personas
                  </CardTitle>
                  <CardDescription>One-click demo — no signup needed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DEMO_PERSONAS.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => handlePersona(persona.id)}
                      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all hover:border-accent hover:bg-accent/5"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${persona.color} text-lg`}>
                        {persona.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{persona.name}</div>
                        <div className="text-xs text-muted-foreground">{persona.role} · {persona.state}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signin" className="space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sign In</CardTitle>
                  <CardDescription>Use your email and password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleLogin}>Sign In</Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Demo mode — no real authentication. Click "Sign In" to continue.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Create Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" placeholder="Your name" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email2" type="email" placeholder="you@example.com" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password2">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="password2" type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={handleLogin}>Create Account</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
