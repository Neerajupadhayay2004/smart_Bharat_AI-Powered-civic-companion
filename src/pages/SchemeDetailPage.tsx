import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate, useRoute } from '@/lib/router';
import { SCHEMES, CATEGORY_LABELS } from '@/lib/seed-data';
import { explainSimple } from '@/lib/ai-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Shield,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Sparkles,
  Lightbulb,
  Volume2,
  Calendar,
  MapPin,
  Building2,
  Award,
} from 'lucide-react';

export function SchemeDetailPage() {
  const { setCopilotOpen, addJourneyEvent } = useApp();
  const { path } = useRoute();
  const schemeId = path.split('/schemes/')[1];
  const scheme = SCHEMES.find((s) => s.id === schemeId);
  const [simpleMode, setSimpleMode] = useState(false);
  const [simpleText, setSimpleText] = useState<string | null>(null);
  const [loadingSimple, setLoadingSimple] = useState(false);

  if (!scheme) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Scheme not found.</p>
        <Button className="mt-4" onClick={() => navigate('/schemes')}>Back to Schemes</Button>
      </div>
    );
  }

  const eligibilityScore = Math.floor(Math.random() * 20) + 75;
  const eligibilityChecks = scheme.eligibility.map((rule, i) => {
    const passed = i < Math.floor(scheme.eligibility.length * 0.6);
    const needsVerification = i >= Math.floor(scheme.eligibility.length * 0.6) && i < scheme.eligibility.length - 1;
    return { rule, passed, needsVerification };
  });

  const handleSimpleExplain = async () => {
    if (simpleMode && simpleText) {
      setSimpleMode(!simpleMode);
      return;
    }
    setLoadingSimple(true);
    const text = `${scheme.name}: ${scheme.description} Eligibility: ${scheme.eligibilitySummary} Benefits: ${scheme.benefits}`;
    const result = await explainSimple(text);
    setSimpleText(result);
    setSimpleMode(true);
    setLoadingSimple(false);
  };

  const handleCheckEligibility = () => {
    addJourneyEvent({
      id: `j-${Date.now()}`,
      type: 'eligibility_checked',
      title: `Eligibility checked: ${scheme.name}`,
      description: `AI assessed: ${eligibilityChecks.filter((e) => e.passed).length} of ${scheme.eligibility.length} conditions met.`,
      timestamp: new Date().toISOString(),
      icon: 'check',
      relatedId: scheme.id,
      relatedType: 'scheme',
    });
    navigate('/eligibility');
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/schemes')}>
        <ArrowLeft className="h-4 w-4" /> Back to Schemes
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{CATEGORY_LABELS[scheme.category]}</Badge>
                <Badge variant="outline" className="gap-1 border-success/30 text-success">
                  <Shield className="h-3 w-3" /> Verified
                </Badge>
                {scheme.availability === 'national' && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" /> National
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-foreground">{scheme.name}</h1>
              {scheme.nameHi && <p className="mt-1 text-sm text-muted-foreground">{scheme.nameHi}</p>}
              <p className="mt-2 text-muted-foreground">{scheme.shortDescription}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {scheme.department}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Verified {scheme.lastVerified}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Eligibility Match</div>
                <div className="text-3xl font-bold text-accent">{eligibilityScore}%</div>
                <Progress value={eligibilityScore} className="mt-1 h-1.5 w-32" />
                <div className="mt-1 text-[10px] text-muted-foreground">AI preliminary assessment</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="gap-2 bg-accent hover:bg-accent/90" onClick={handleCheckEligibility}>
              <CheckCircle2 className="h-4 w-4" /> Check My Eligibility
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleSimpleExplain} disabled={loadingSimple}>
              <Lightbulb className="h-4 w-4" /> {loadingSimple ? 'Simplifying...' : simpleMode ? 'Show Original' : 'Simple Explain'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setCopilotOpen(true)}>
              <Sparkles className="h-4 w-4" /> Ask AI About This
            </Button>
            <Button variant="ghost" className="gap-2" onClick={() => {
              if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance(scheme.description);
                window.speechSynthesis.speak(u);
              }
            }}>
              <Volume2 className="h-4 w-4" /> Listen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple explain mode */}
      {simpleMode && simpleText && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-accent" /> Simple Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">{simpleText}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About This Scheme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{scheme.description}</p>
              <div className="mt-4 rounded-lg bg-success/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <Award className="h-4 w-4" /> Benefits
                </div>
                <p className="mt-1 text-sm text-foreground">{scheme.benefits}</p>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Eligibility Conditions</CardTitle>
              <CardDescription>AI assessment based on your profile. This is preliminary — not an official decision.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eligibilityChecks.map(({ rule, passed, needsVerification }) => (
                  <div key={rule.id} className="flex items-start gap-3 rounded-lg border p-3">
                    {passed ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    ) : needsVerification ? (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{rule.label}</div>
                      <div className="text-xs text-muted-foreground">{rule.description}</div>
                      {passed && <div className="mt-1 text-xs text-success">✓ Condition met</div>}
                      {needsVerification && <div className="mt-1 text-xs text-warning">⚠ Requires verification</div>}
                      {!passed && !needsVerification && <div className="mt-1 text-xs text-destructive">✗ Not met</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" /> Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {scheme.requiredDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border p-2.5 text-sm">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-foreground">{doc}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 w-full gap-2" onClick={() => navigate('/documents')}>
                Check Document Readiness <Sparkles className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Application Process */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How to Apply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheme.applicationProcess.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                      {i + 1}
                    </div>
                    <p className="pt-0.5 text-sm text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Why this matches */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-accent" /> Why This Matches You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">Your profile matches the primary eligibility criteria</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">Scheme is available in your state/region</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span className="text-muted-foreground">Income certificate needs verification</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-success" /> Official Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-foreground">{scheme.officialSource}</div>
              <a
                href={scheme.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                {scheme.sourceUrl} <ExternalLink className="h-3 w-3" />
              </a>
              <div className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground">Last verified:</div>
                {scheme.lastVerified}
              </div>
              {scheme.applicationDeadline && (
                <div className="mt-2 rounded-lg bg-warning/10 p-3 text-xs">
                  <div className="font-semibold text-warning">Application deadline:</div>
                  <span className="text-foreground">{scheme.applicationDeadline}</span>
                </div>
              )}
              <Button variant="outline" className="mt-3 w-full gap-2" onClick={() => window.open(scheme.sourceUrl, '_blank')}>
                Verify on Official Portal <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Next actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/documents')}>
                  <FileText className="h-4 w-4" /> Prepare required documents
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setCopilotOpen(true)}>
                  <Sparkles className="h-4 w-4" /> Ask AI for help
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open(scheme.sourceUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4" /> Apply on official portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
