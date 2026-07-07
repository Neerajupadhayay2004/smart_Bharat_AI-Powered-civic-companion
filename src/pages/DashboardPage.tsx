import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { SCHEMES, DASHBOARD_STATS, DEMO_PERSONAS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Search,
  FileText,
  MapPin,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  Activity,
} from 'lucide-react';


const JOURNEY_ICONS: Record<string, any> = {
  scheme_discovered: Search,
  eligibility_checked: CheckCircle2,
  documents_prepared: FileCheck,
  application_started: Send,
  complaint_submitted: MapPin,
  complaint_updated: Clock,
  complaint_escalated: AlertCircle,
  issue_resolved: CheckCircle2,
  ai_consultation: Sparkles,
};

export function DashboardPage() {
  const { persona, setCopilotOpen, journey, complaints } = useApp();
  const personaData = persona ? DEMO_PERSONAS.find((p) => p.id === persona) : null;
  const greetingName = personaData?.name || 'Citizen';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const recommendedSchemes = SCHEMES.slice(0, 3);
  const activeComplaints = complaints.filter((c) => c.status !== 'resolved').slice(0, 3);

  const nextActions = [
    { icon: FileCheck, title: 'Complete your income certificate', desc: 'Needed for 3 recommended schemes', priority: 'high', action: () => navigate('/documents') },
    { icon: Send, title: 'Start scholarship application', desc: 'Post Matric Scholarship deadline approaching', priority: 'high', action: () => navigate('/schemes/pmsss') },
    { icon: AlertCircle, title: 'Escalate pending complaint', desc: 'SB-2025-002 unresolved for 10+ days', priority: 'medium', action: () => navigate('/complaints/c2') },
    { icon: Search, title: 'Check PM-KISAN eligibility', desc: 'You may qualify for ₹6,000/year support', priority: 'medium', action: () => navigate('/schemes/pmkisan') },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {greetingName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {personaData
              ? `You're exploring as ${personaData.role} from ${personaData.state}. Here's your civic overview.`
              : 'Here\'s your personalized civic overview.'}
          </p>
        </div>
        {personaData && (
          <Badge variant="outline" className="w-fit gap-1.5 border-accent/30 bg-accent/5 text-accent">
            <span className="text-base">{personaData.avatar}</span>
            {personaData.role} Demo
          </Badge>
        )}
      </div>

      {/* AI Search Bar */}
      <Card className="border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bharat-gradient">
              <Sparkles className="h-6 w-6" style={{ color: 'hsl(25 95% 60%)' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Ask Bharat AI anything</div>
              <div className="text-xs text-muted-foreground">Schemes, eligibility, documents, complaints — in your language</div>
            </div>
            <Button className="gap-2 bg-accent hover:bg-accent/90" onClick={() => setCopilotOpen(true)}>
              <Sparkles className="h-4 w-4" /> Ask Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Schemes Discovered', value: DASHBOARD_STATS.schemesDiscovered, icon: Search, color: 'text-blue-500' },
          { label: 'Applications Prepared', value: DASHBOARD_STATS.applicationsPrepared, icon: FileText, color: 'text-accent' },
          { label: 'Documents Ready', value: DASHBOARD_STATS.documentsCompleted, icon: FileCheck, color: 'text-success' },
          { label: 'Civic Impact Score', value: DASHBOARD_STATS.civicImpactScore, icon: TrendingUp, color: 'text-purple-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended Schemes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recommended Schemes for You</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/schemes')}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {recommendedSchemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="cursor-pointer transition-all hover:border-accent hover:shadow-md"
                onClick={() => navigate(`/schemes/${scheme.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{scheme.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">{scheme.category}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{scheme.shortDescription}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{scheme.department}</span>
                        <span>·</span>
                        <span className="text-success">✓ Verified {scheme.lastVerified}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-muted-foreground">Match</div>
                      <div className="text-lg font-bold text-accent">
                        {Math.floor(Math.random() * 20) + 75}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Best Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Next Best Actions</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {nextActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={action.action}
                      className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${action.priority === 'high' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.desc}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Complaints + Journey */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Complaints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Active Complaints</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/complaints')}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {activeComplaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/complaints/${complaint.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{complaint.ticketId}</Badge>
                        <Badge
                          variant="secondary"
                          className={
                            complaint.urgency === 'critical' ? 'bg-destructive/10 text-destructive' :
                            complaint.urgency === 'high' ? 'bg-warning/10 text-warning' : ''
                          }
                        >
                          {complaint.urgency}
                        </Badge>
                      </div>
                      <h3 className="mt-1.5 text-sm font-medium text-foreground">{complaint.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{complaint.department}</p>
                    </div>
                    <StatusBadge status={complaint.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/report')}>
              <MapPin className="h-4 w-4" /> Report New Issue
            </Button>
          </div>
        </div>

        {/* Civic Journey Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Civic Journey</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/journey')}>
              Full timeline <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-4">
                  {journey.slice(0, 6).map((event, i) => {
                    const Icon = JOURNEY_ICONS[event.type] || Activity;
                    return (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                            <Icon className="h-4 w-4" />
                          </div>
                          {i < 5 && <div className="mt-1 h-full w-px bg-border" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="text-sm font-medium text-foreground">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.description}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Local Civic Pulse */}
      <Card className="border-accent/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Local Civic Pulse</CardTitle>
              <CardDescription>AI summary of civic issues in your area</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">AI Civic Pulse: </span>
            3 garbage overflow complaints reported in South Delhi this week. 1 pothole issue escalated in Connaught Place after 10 days. MCD sanitation team workload at 85%. Consider proactive drain cleaning before next rainfall.
          </div>
          <Button variant="ghost" size="sm" className="mt-3 gap-1" onClick={() => navigate('/impact')}>
            View full Civic Impact Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    submitted: 'bg-muted text-muted-foreground',
    under_review: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-warning/10 text-warning',
    resolved: 'bg-success/10 text-success',
    escalated: 'bg-destructive/10 text-destructive',
  };
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    escalated: 'Escalated',
  };
  return (
    <Badge variant="secondary" className={`shrink-0 ${colors[status] || ''}`}>
      {labels[status] || status}
    </Badge>
  );
}
