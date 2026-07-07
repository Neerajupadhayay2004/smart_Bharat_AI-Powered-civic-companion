import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { analyzeDocument } from '@/lib/ai-service';
import { SCHEMES } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Shield,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';


const COMMON_DOCUMENTS = [
  { id: 'aadhaar', name: 'Aadhaar Card', desc: 'Identity proof' },
  { id: 'pan', name: 'PAN Card', desc: 'Tax identification' },
  { id: 'income', name: 'Income Certificate', desc: 'Proof of income' },
  { id: 'caste', name: 'Caste Certificate', desc: 'Category proof (if applicable)' },
  { id: 'residence', name: 'Residence Proof', desc: 'Address verification' },
  { id: 'bank', name: 'Bank Passbook', desc: 'Bank account details' },
  { id: 'marksheet', name: 'Educational Certificates', desc: 'Academic qualifications' },
  { id: 'photo', name: 'Passport Photo', desc: 'Recent photograph' },
];

export function DocumentsPage() {
  const { setCopilotOpen } = useApp();
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<string, { fileName: string; analysis: any }>>({});
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

  const scheme = SCHEMES.find((s) => s.id === selectedScheme);
  const requiredDocs = scheme?.requiredDocuments || COMMON_DOCUMENTS.map((d) => d.name);

  const handleUpload = async (docName: string, fileName: string) => {
    setAnalyzing(docName);
    const analysis = await analyzeDocument(fileName, '');
    setUploaded((prev) => ({ ...prev, [docName]: { fileName, analysis } }));
    setAnalyzing(null);
  };

  const handleDelete = (docName: string) => {
    setUploaded((prev) => {
      const next = { ...prev };
      delete next[docName];
      return next;
    });
  };

  const uploadedCount = Object.keys(uploaded).length;
  const totalRequired = requiredDocs.length;
  const readinessScore = totalRequired > 0 ? Math.round((uploadedCount / totalRequired) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Document Assistant</h1>
        <p className="mt-1 text-muted-foreground">Privacy-first document readiness check. AI classifies, extracts, and scores your documents.</p>
      </div>

      {/* Privacy notice */}
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex items-start gap-3 pt-6">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <div className="text-sm font-semibold text-foreground">Privacy-First Document Analysis</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Documents are analyzed in your browser session only. Sensitive information is masked in the interface.
              You can delete any document at any time. AI checks do not replace official verification.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scheme selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select a Service</CardTitle>
          <CardDescription>Choose a scheme to see required documents and check readiness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedScheme(null)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${!selectedScheme ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}
            >
              Common Documents
            </button>
            {SCHEMES.slice(0, 8).map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScheme(s.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${selectedScheme === s.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}
              >
                {s.name.length > 30 ? s.name.slice(0, 30) + '...' : s.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Readiness Score */}
      <Card className="border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">Document Readiness Score</div>
              <div className="text-xs text-muted-foreground">
                {uploadedCount} of {totalRequired} required documents uploaded
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${readinessScore >= 80 ? 'text-success' : readinessScore >= 50 ? 'text-accent' : 'text-warning'}`}>
                {readinessScore}%
              </div>
              <Progress value={readinessScore} className="mt-1 h-2 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document checklist */}
      <div className="grid gap-4 md:grid-cols-2">
        {requiredDocs.map((docName) => {
          const doc = uploaded[docName];
          return (
            <Card key={docName} className={doc ? 'border-success/30' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${doc ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {doc ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{docName}</div>
                      {doc ? (
                        <div className="text-xs text-success">✓ Uploaded & analyzed</div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Not uploaded yet</div>
                      )}
                    </div>
                  </div>
                  {doc ? (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(docName)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(docName, file.name);
                        }}
                      />
                      <div className="flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-muted">
                        <Upload className="h-4 w-4" /> Upload
                      </div>
                    </label>
                  )}
                </div>

                {analyzing === docName && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 animate-pulse text-accent" /> AI analyzing document...
                  </div>
                )}

                {doc && doc.analysis && (
                  <div className="mt-3 space-y-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{doc.analysis.documentType}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        Readability: {doc.analysis.readability}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {doc.analysis.extractedFields.map((field: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{field.label}:</span>
                          <span className="flex items-center gap-1 font-mono">
                            {showMasked[`${docName}-${i}`] ? field.value : '••••••••'}
                            <button
                              onClick={() => setShowMasked((prev) => ({ ...prev, [`${docName}-${i}`]: !prev[`${docName}-${i}`] }))}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {showMasked[`${docName}-${i}`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                    {doc.analysis.issues.length > 0 && (
                      <div className="space-y-1">
                        {doc.analysis.issues.map((issue: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-warning">
                            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {issue}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Shield className="h-3 w-3" /> AI check does not replace official verification
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <Sparkles className="h-5 w-5 text-accent" />
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">Need help with documents?</div>
            <div className="text-xs text-muted-foreground">Ask Bharat AI which documents you need and how to get them</div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCopilotOpen(true)}>
            <Sparkles className="h-4 w-4" /> Ask AI
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
