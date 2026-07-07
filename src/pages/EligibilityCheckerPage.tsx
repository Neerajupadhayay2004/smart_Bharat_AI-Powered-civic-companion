import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { SCHEMES, CATEGORY_LABELS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, AlertCircle, XCircle, Sparkles, ArrowRight, Shield } from 'lucide-react';
import type { CitizenProfile } from '@/lib/types';

export function EligibilityCheckerPage() {
  const { profile, setProfile, addJourneyEvent } = useApp();
  const [form, setForm] = useState<CitizenProfile>(profile || {});
  const [results, setResults] = useState<{ scheme: typeof SCHEMES[0]; score: number; checks: { label: string; passed: boolean; needsVerification: boolean }[] }[] | null>(null);

  const handleCheck = () => {
    setProfile(form);
    const results = SCHEMES.map((scheme) => {
      let score = 50;
      const checks: { label: string; passed: boolean; needsVerification: boolean }[] = [];

      scheme.eligibility.forEach((rule) => {
        let passed = false;
        let needsVerification = false;

        if (rule.field === 'age' && form.age) {
          if (rule.operator === 'gte') passed = form.age >= (rule.value as number);
          else if (rule.operator === 'lte') passed = form.age <= (rule.value as number);
        } else if (rule.field === 'income' && form.incomeRange) {
          const incomeMap: Record<string, number> = { '0-1 lakh': 100000, '0-3 lakh': 300000, '1-3 lakh': 300000, '3-6 lakh': 600000, '6-10 lakh': 1000000, '10+ lakh': 1500000 };
          const income = incomeMap[form.incomeRange] || 0;
          if (rule.operator === 'lte') passed = income <= (rule.value as number);
          else if (rule.operator === 'lt') passed = income < (rule.value as number);
        } else if (rule.field === 'isStudent' && form.isStudent !== undefined) {
          passed = form.isStudent === rule.value;
        } else if (rule.field === 'isFarmer' && form.isFarmer !== undefined) {
          passed = form.isFarmer === rule.value;
        } else if (rule.field === 'location' && form.location) {
          passed = form.location === rule.value;
        } else if (rule.field === 'gender' && form.gender) {
          if (Array.isArray(rule.value)) passed = rule.value.includes(form.gender) || rule.value.includes('any');
          else passed = form.gender === rule.value;
        } else {
          needsVerification = true;
        }

        if (passed) score += 15;
        else if (needsVerification) score += 5;
        else score -= 5;

        checks.push({ label: rule.label, passed, needsVerification });
      });

      score = Math.max(0, Math.min(100, score));
      return { scheme, score, checks };
    })
      .filter((r) => r.score > 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    setResults(results);
    addJourneyEvent({
      id: `j-${Date.now()}`,
      type: 'eligibility_checked',
      title: 'AI Eligibility Check completed',
      description: `Assessed ${results.length} schemes against your profile.`,
      timestamp: new Date().toISOString(),
      icon: 'check',
      relatedType: 'scheme',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Eligibility Checker</h1>
        <p className="mt-1 text-muted-foreground">Enter your details and let AI assess which schemes you qualify for.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Your Profile</CardTitle>
            <CardDescription>All fields optional. More info = better matches.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Age</Label>
              <Input type="number" placeholder="e.g. 25" value={form.age || ''} onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || undefined })} />
            </div>
            <div>
              <Label>State</Label>
              <Select value={form.state || ''} onValueChange={(v) => setForm({ ...form, state: v })}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {['Bihar', 'Delhi', 'Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Punjab', 'Haryana', 'Madhya Pradesh', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Gujarat'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Occupation</Label>
              <Select value={form.occupation || ''} onValueChange={(v) => setForm({ ...form, occupation: v })}>
                <SelectTrigger><SelectValue placeholder="Select occupation" /></SelectTrigger>
                <SelectContent>
                  {['Student', 'Farmer', 'Private Employee', 'Government Employee', 'Business Owner', 'Daily Wage Worker', 'Homemaker', 'Retired', 'Unemployed'].map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Annual Family Income</Label>
              <Select value={form.incomeRange || ''} onValueChange={(v) => setForm({ ...form, incomeRange: v })}>
                <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                <SelectContent>
                  {['0-1 lakh', '0-3 lakh', '1-3 lakh', '3-6 lakh', '6-10 lakh', '10+ lakh'].map((i) => (
                    <SelectItem key={i} value={i}>₹{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <RadioGroup value={form.gender || ''} onValueChange={(v) => setForm({ ...form, gender: v })} className="flex gap-4">
                <div className="flex items-center gap-2"><RadioGroupItem value="male" id="m" /><Label htmlFor="m">Male</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="female" id="f" /><Label htmlFor="f">Female</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="other" id="o" /><Label htmlFor="o">Other</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label>Location Type</Label>
              <RadioGroup value={form.location || ''} onValueChange={(v) => setForm({ ...form, location: v as 'rural' | 'urban' })} className="flex gap-4">
                <div className="flex items-center gap-2"><RadioGroupItem value="rural" id="r" /><Label htmlFor="r">Rural</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="urban" id="u" /><Label htmlFor="u">Urban</Label></div>
              </RadioGroup>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="student" checked={form.isStudent || false} onChange={(e) => setForm({ ...form, isStudent: e.target.checked })} className="rounded" />
              <Label htmlFor="student">I am a student</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="farmer" checked={form.isFarmer || false} onChange={(e) => setForm({ ...form, isFarmer: e.target.checked })} className="rounded" />
              <Label htmlFor="farmer">I am a farmer</Label>
            </div>
            <Button className="w-full gap-2 bg-accent hover:bg-accent/90" onClick={handleCheck}>
              <Sparkles className="h-4 w-4" /> Check Eligibility
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!results && (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-accent" />
                <p className="mt-3 font-medium text-foreground">Enter your details and click "Check Eligibility"</p>
                <p className="text-sm text-muted-foreground">AI will assess all schemes and rank them by match score</p>
              </CardContent>
            </Card>
          )}
          {results && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your Eligibility Results</h2>
                <Badge variant="secondary">{results.length} matching schemes</Badge>
              </div>
              {results.map(({ scheme, score, checks }) => (
                <Card key={scheme.id} className="cursor-pointer transition-all hover:shadow-md" onClick={() => navigate(`/schemes/${scheme.id}`)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{scheme.name}</h3>
                          <Badge variant="secondary" className="text-[10px]">{CATEGORY_LABELS[scheme.category]}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{scheme.shortDescription}</p>
                      </div>
                      <div className="shrink-0 text-center">
                        <div className={`text-2xl font-bold ${score > 75 ? 'text-success' : score > 50 ? 'text-accent' : 'text-warning'}`}>
                          {score}%
                        </div>
                        <Progress value={score} className="mt-1 h-1.5 w-20" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {checks.map((c, i) => (
                        <div key={i} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${c.passed ? 'bg-success/10 text-success' : c.needsVerification ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                          {c.passed ? <CheckCircle2 className="h-2.5 w-2.5" /> : c.needsVerification ? <AlertCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                          {c.label}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 text-success" /> {scheme.officialSource}
                      <ArrowRight className="h-3 w-3" /> View details
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
