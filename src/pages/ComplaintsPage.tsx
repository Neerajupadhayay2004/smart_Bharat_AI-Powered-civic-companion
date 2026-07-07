import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { COMPLAINT_CATEGORY_LABELS, STATUS_LABELS } from '@/lib/seed-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Filter, AlertCircle } from 'lucide-react';
import type { ComplaintStatus } from '@/lib/types';

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  submitted: 'bg-muted text-muted-foreground',
  under_review: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-warning/10 text-warning',
  resolved: 'bg-success/10 text-success',
  escalated: 'bg-destructive/10 text-destructive',
};

const URGENCY_COLORS: Record<string, string> = {
  low: '',
  medium: '',
  high: 'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
};

export function ComplaintsPage() {
  const { complaints } = useApp();
  const [filter, setFilter] = useState<ComplaintStatus | 'all'>('all');

  const filtered = complaints.filter((c) => filter === 'all' || c.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
          <p className="mt-1 text-muted-foreground">Track all your civic complaints and their status.</p>
        </div>
        <Button className="gap-2 bg-accent hover:bg-accent/90" onClick={() => navigate('/report')}>
          <Plus className="h-4 w-4" /> Report Issue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${filter === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <Filter className="h-3.5 w-3.5" /> All ({complaints.length})
        </button>
        {(Object.keys(STATUS_LABELS) as ComplaintStatus[]).map((status) => {
          const count = complaints.filter((c) => c.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${filter === status ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted'}`}
            >
              {STATUS_LABELS[status]} ({count})
            </button>
          );
        })}
      </div>

      {/* Complaint list */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((complaint) => (
          <Card
            key={complaint.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => navigate(`/complaints/${complaint.id}`)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{complaint.ticketId}</Badge>
                    {complaint.isMock && <Badge variant="secondary" className="text-[10px]">DEMO</Badge>}
                  </div>
                  <h3 className="mt-1.5 font-medium text-foreground">{complaint.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                </div>
                {complaint.imageUrl && (
                  <img src={complaint.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{COMPLAINT_CATEGORY_LABELS[complaint.category]}</Badge>
                <Badge variant="secondary" className={`text-[10px] ${URGENCY_COLORS[complaint.urgency]}`}>{complaint.urgency}</Badge>
                <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[complaint.status]}`}>{STATUS_LABELS[complaint.status]}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {complaint.location.area}
                <span>·</span>
                <span>{complaint.department}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No complaints in this category.</p>
        </div>
      )}
    </div>
  );
}
