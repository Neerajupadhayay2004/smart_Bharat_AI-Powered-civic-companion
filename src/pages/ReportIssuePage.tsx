import { useState, useRef } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { generateComplaint } from '@/lib/ai-service';
import { COMPLAINT_CATEGORY_LABELS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MapPin,
  Mic,
  Sparkles,
  AlertTriangle,
  Send,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import type { Complaint, ComplaintCategory } from '@/lib/types';

const CATEGORIES = Object.entries(COMPLAINT_CATEGORY_LABELS).map(([value, label]) => ({ value: value as ComplaintCategory, label }));

const SAMPLE_IMAGES = [
  { url: 'https://images.pexels.com/photos/2662086/pexels-photo-2662086.jpeg?auto=compress&cs=tinysrgb&w=400', label: 'Garbage overflow', category: 'garbage' as ComplaintCategory },
  { url: 'https://images.pexels.com/photos/2531709/pexels-photo-2531709.jpeg?auto=compress&cs=tinysrgb&w=400', label: 'Pothole', category: 'potholes' as ComplaintCategory },
  { url: 'https://images.pexels.com/photos/2540405/pexels-photo-2540405.jpeg?auto=compress&cs=tinysrgb&w=400', label: 'Water logging', category: 'water' as ComplaintCategory },
];

export function ReportIssuePage() {
  const { addComplaint, addJourneyEvent, setCopilotOpen } = useApp();
  const [category, setCategory] = useState<ComplaintCategory>('garbage');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<{ title: string; body: string; urgency: string; department: string } | null>(null);
  const [submitted, setSubmitted] = useState<Complaint | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported. Try Chrome.'); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = 'en-IN';
    r.onresult = (e: any) => { setDescription(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    const result = await generateComplaint(description, category, location || 'your area');
    setGenerated(result);
    setLoading(false);
  };

  const handleSubmit = () => {
    const ticketId = `SB-2025-${String(Math.floor(Math.random() * 900) + 100)}`;
    const now = new Date().toISOString();
    const complaint: Complaint = {
      id: `c-${Date.now()}`,
      ticketId,
      title: generated?.title || description.slice(0, 60),
      description: generated?.body || description,
      category,
      urgency: (generated?.urgency || 'medium') as Complaint['urgency'],
      status: 'submitted',
      department: generated?.department || 'Municipal Corporation (MCD)',
      location: {
        lat: 28.5 + Math.random() * 0.1,
        lng: 77.2 + Math.random() * 0.1,
        address: location || 'Location to be confirmed',
        area: location || 'Your area',
      },
      imageUrl: imageUrl || undefined,
      createdAt: now,
      updatedAt: now,
      isMock: false,
      timeline: [
        { status: 'submitted', timestamp: now, note: 'Complaint submitted via Smart Bharat AI', by: 'Citizen' },
      ],
    };

    addComplaint(complaint);
    addJourneyEvent({
      id: `j-${Date.now()}`,
      type: 'complaint_submitted',
      title: `Complaint filed: ${complaint.title}`,
      description: `Ticket ${ticketId} created. Assigned to ${complaint.department}. AI-generated complaint.`,
      timestamp: now,
      icon: 'alert',
      relatedId: complaint.id,
      relatedType: 'complaint',
    });
    setSubmitted(complaint);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-success/30">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">Complaint Submitted Successfully!</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your complaint has been registered and assigned.</p>
            <div className="mt-4 rounded-lg bg-muted p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ticket ID</span>
                <Badge variant="secondary" className="font-mono">{submitted.ticketId}</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Department</span>
                <span className="text-sm font-medium">{submitted.department}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Urgency</span>
                <Badge variant={submitted.urgency === 'critical' ? 'destructive' : submitted.urgency === 'high' ? 'default' : 'secondary'}>
                  {submitted.urgency}
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={() => navigate(`/complaints/${submitted.id}`)}>
                Track Complaint
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setSubmitted(null); setGenerated(null); setDescription(''); }}>
                Report Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report a Civic Issue</h1>
        <p className="mt-1 text-muted-foreground">AI will categorize your issue, identify the department, and generate a professional complaint.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ComplaintCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Describe the Issue</Label>
                <div className="relative">
                  <Textarea
                    placeholder="e.g. There is an overflowing garbage dump near my house for the last five days..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="pr-10"
                  />
                  <button
                    onClick={handleVoice}
                    className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg ${listening ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}
                  >
                    <Mic className={`h-4 w-4 ${listening ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </div>

              <div>
                <Label>Location / Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g. Block C, Saket, South Delhi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div>
                <Label>Add Photo (optional)</Label>
                <div className="space-y-2">
                  {SAMPLE_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      onClick={() => setImageUrl(imageUrl === img.url ? null : img.url)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-2 transition-colors ${imageUrl === img.url ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted'}`}
                    >
                      <img src={img.url} alt={img.label} className="h-12 w-12 rounded object-cover" />
                      <span className="text-sm text-foreground">{img.label}</span>
                      {imageUrl === img.url && <CheckCircle2 className="ml-auto h-4 w-4 text-accent" />}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full gap-2 bg-accent hover:bg-accent/90" onClick={handleGenerate} disabled={loading || !description.trim()}>
                <Sparkles className="h-4 w-4" /> {loading ? 'AI generating...' : 'Generate AI Complaint'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-accent" /> AI-Generated Complaint
              </CardTitle>
              <CardDescription>AI analyzes your input and creates a professional complaint</CardDescription>
            </CardHeader>
            <CardContent>
              {!generated ? (
                <div className="py-12 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">Fill in the details and click "Generate AI Complaint"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {imageUrl && (
                    <img src={imageUrl} alt="Issue" className="h-40 w-full rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground">Title</div>
                    <div className="font-medium text-foreground">{generated.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" /> {generated.urgency}</Badge>
                    <Badge variant="outline" className="gap-1"><Building2 className="h-3 w-3" /> {generated.department}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Complaint Letter</div>
                    <div className="mt-1 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm text-foreground">{generated.body}</div>
                  </div>
                  <Button className="w-full gap-2" onClick={handleSubmit}>
                    <Send className="h-4 w-4" /> Submit Complaint
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-foreground">Need help describing the issue? Ask Bharat AI.</span>
              </div>
              <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setCopilotOpen(true)}>
                <Sparkles className="h-4 w-4" /> Ask AI for Help
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
