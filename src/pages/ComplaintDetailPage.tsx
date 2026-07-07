import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate, useRoute } from '@/lib/router';
import { COMPLAINT_CATEGORY_LABELS, STATUS_LABELS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Send,
  ArrowUpCircle,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import type { ComplaintStatus, ComplaintStatusEvent } from '@/lib/types';

const STATUS_ICONS: Record<ComplaintStatus, any> = {
  submitted: Send,
  under_review: Clock,
  in_progress: AlertTriangle,
  resolved: CheckCircle2,
  escalated: ArrowUpCircle,
};

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  submitted: 'bg-muted text-muted-foreground',
  under_review: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-warning/10 text-warning',
  resolved: 'bg-success/10 text-success',
  escalated: 'bg-destructive/10 text-destructive',
};

export function ComplaintDetailPage() {
  const { complaints, updateComplaint, addJourneyEvent } = useApp();
  const { path } = useRoute();
  const complaintId = path.split('/complaints/')[1];
  const complaint = complaints.find((c) => c.id === complaintId);
  const [escalating, setEscalating] = useState(false);

  if (!complaint) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Complaint not found.</p>
        <Button className="mt-4" onClick={() => navigate('/complaints')}>Back to Complaints</Button>
      </div>
    );
  }

  const handleEscalate = () => {
    setEscalating(true);
    const now = new Date().toISOString();
    const newEvent: ComplaintStatusEvent = {
      status: 'escalated',
      timestamp: now,
      note: 'Complaint escalated by citizen via Smart Bharat AI. No resolution within expected timeframe.',
      by: 'Citizen (via Smart Bharat)',
    };
    updateComplaint(complaint.id, {
      status: 'escalated',
      updatedAt: now,
      timeline: [...complaint.timeline, newEvent],
    });
    addJourneyEvent({
      id: `j-${Date.now()}`,
      type: 'complaint_escalated',
      title: `Complaint escalated: ${complaint.title}`,
      description: `Ticket ${complaint.ticketId} escalated to senior authority.`,
      timestamp: now,
      icon: 'alert',
      relatedId: complaint.id,
      relatedType: 'complaint',
    });
    setTimeout(() => setEscalating(false), 1000);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/complaints')}>
        <ArrowLeft className="h-4 w-4" /> Back to Complaints
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono">{complaint.ticketId}</Badge>
                <Badge variant="secondary" className={STATUS_COLORS[complaint.status]}>{STATUS_LABELS[complaint.status]}</Badge>
                <Badge variant="secondary" className={complaint.urgency === 'critical' ? 'bg-destructive/10 text-destructive' : complaint.urgency === 'high' ? 'bg-warning/10 text-warning' : ''}>
                  {complaint.urgency} urgency
                </Badge>
                {complaint.isMock && <Badge variant="outline">DEMO DATA</Badge>}
              </div>
              <h1 className="mt-3 text-xl font-bold text-foreground">{complaint.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {complaint.department}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {complaint.location.address}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Filed {new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
            {complaint.status !== 'resolved' && complaint.status !== 'escalated' && (
              <Button variant="outline" className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleEscalate} disabled={escalating}>
                <ArrowUpCircle className="h-4 w-4" /> {escalating ? 'Escalating...' : 'Escalate'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Description + Image */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.imageUrl && (
                <img src={complaint.imageUrl} alt="Issue" className="mb-4 h-48 w-full rounded-lg object-cover" />
              )}
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{complaint.description}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> Complaint Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complaint.timeline.map((event, i) => {
                  const Icon = STATUS_ICONS[event.status];
                  const isLast = i === complaint.timeline.length - 1;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${STATUS_COLORS[event.status]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!isLast && <div className="mt-1 h-full w-px bg-border min-h-[2rem]" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{STATUS_LABELS[event.status]}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{event.note}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(event.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <span>·</span>
                          <span>{event.by}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Complaint Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Category</div>
                <div className="font-medium">{COMPLAINT_CATEGORY_LABELS[complaint.category]}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Department</div>
                <div className="font-medium">{complaint.department}</div>
              </div>
              {complaint.assignedTo && (
                <div>
                  <div className="text-xs text-muted-foreground">Assigned To</div>
                  <div className="font-medium">{complaint.assignedTo}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> {complaint.location.address}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Filed</div>
                <div className="font-medium">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last Updated</div>
                <div className="font-medium">{new Date(complaint.updatedAt).toLocaleDateString('en-IN')}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4" /> Add Update
              </Button>
              {complaint.status !== 'resolved' && complaint.status !== 'escalated' && (
                <Button variant="outline" className="w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleEscalate}>
                  <ArrowUpCircle className="h-4 w-4" /> Escalate Complaint
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/report')}>
                <ImageIcon className="h-4 w-4" /> Report Similar Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
