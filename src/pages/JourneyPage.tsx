import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  CheckCircle2,
  FileCheck,
  Send,
  MapPin,
  Clock,
  AlertCircle,
  Sparkles,
  Lightbulb,
  Route,
  TrendingUp,
} from 'lucide-react';
import type { } from '@/lib/types';

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

const JOURNEY_COLORS: Record<string, string> = {
  scheme_discovered: 'bg-blue-100 text-blue-600',
  eligibility_checked: 'bg-success/10 text-success',
  documents_prepared: 'bg-purple-100 text-purple-600',
  application_started: 'bg-accent/10 text-accent',
  complaint_submitted: 'bg-warning/10 text-warning',
  complaint_updated: 'bg-orange-100 text-orange-600',
  complaint_escalated: 'bg-destructive/10 text-destructive',
  issue_resolved: 'bg-success/10 text-success',
  ai_consultation: 'bg-primary/10 text-primary',
};

const JOURNEY_LABELS: Record<string, string> = {
  scheme_discovered: 'Scheme Discovered',
  eligibility_checked: 'Eligibility Checked',
  documents_prepared: 'Documents Prepared',
  application_started: 'Application Started',
  complaint_submitted: 'Complaint Submitted',
  complaint_updated: 'Complaint Updated',
  complaint_escalated: 'Complaint Escalated',
  issue_resolved: 'Issue Resolved',
  ai_consultation: 'AI Consultation',
};

export function JourneyPage() {
  const { journey } = useApp();

  const nextActions = [
    { icon: FileCheck, title: 'Complete income certificate', desc: 'Required for 3 schemes', action: () => navigate('/documents') },
    { icon: Send, title: 'Submit scholarship application', desc: 'Deadline approaching', action: () => navigate('/schemes/pmsss') },
    { icon: AlertCircle, title: 'Escalate pending complaint', desc: 'Unresolved for 10+ days', action: () => navigate('/complaints/c2') },
    { icon: Search, title: 'Explore more schemes', desc: 'New schemes added recently', action: () => navigate('/schemes') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Civic Journey Timeline</h1>
        <p className="mt-1 text-muted-foreground">Your complete civic story — from scheme discovery to complaint resolution.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Route className="h-4 w-4 text-accent" /> Your Civic Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-1">
                  {journey.map((event, i) => {
                    const Icon = JOURNEY_ICONS[event.type] || Sparkles;
                    const color = JOURNEY_COLORS[event.type] || 'bg-muted text-muted-foreground';
                    const isLast = i === journey.length - 1;
                    return (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {!isLast && <div className="my-1 w-0.5 flex-1 bg-border" style={{ minHeight: '3rem' }} />}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">{JOURNEY_LABELS[event.type]}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <div className="mt-1.5 font-medium text-foreground">{event.title}</div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
                          {event.relatedId && event.relatedType === 'scheme' && (
                            <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs text-accent" onClick={() => navigate(`/schemes/${event.relatedId}`)}>
                              View scheme →
                            </Button>
                          )}
                          {event.relatedId && event.relatedType === 'complaint' && (
                            <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs text-accent" onClick={() => navigate(`/complaints/${event.relatedId}`)}>
                              View complaint →
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Next Best Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-accent" /> Next Best Civic Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nextActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      onClick={action.action}
                      className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div className="text-sm font-semibold text-foreground">Civic Impact Score</div>
              </div>
              <div className="mt-2 text-3xl font-bold text-accent">78</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on your civic engagement: schemes discovered, documents prepared, complaints filed and resolved.
              </p>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate('/impact')}>
                View Impact Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
