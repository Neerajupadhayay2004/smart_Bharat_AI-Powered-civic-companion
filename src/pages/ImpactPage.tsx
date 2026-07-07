import { useApp } from '@/lib/app-context';
import { DASHBOARD_STATS, ADMIN_METRICS, COMPLAINT_CATEGORY_LABELS, STATUS_LABELS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  FileText,
  FileCheck,
  CheckCircle2,
  Activity,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  garbage: 'hsl(25 95% 53%)',
  potholes: 'hsl(222 56% 30%)',
  streetlight: 'hsl(38 92% 50%)',
  water: 'hsl(200 80% 50%)',
  drainage: 'hsl(160 84% 39%)',
  road: 'hsl(280 60% 55%)',
  safety: 'hsl(0 72% 51%)',
  dumping: 'hsl(160 84% 30%)',
};

const STATUS_COLORS: Record<string, string> = {
  resolved: 'hsl(160 84% 39%)',
  in_progress: 'hsl(38 92% 50%)',
  under_review: 'hsl(200 80% 50%)',
  submitted: 'hsl(222 15% 60%)',
  escalated: 'hsl(0 72% 51%)',
};

export function ImpactPage() {
  const {} = useApp();


  const categoryData = ADMIN_METRICS.byCategory.map((c) => ({
    name: COMPLAINT_CATEGORY_LABELS[c.category],
    count: c.count,
    fill: CATEGORY_COLORS[c.category],
  }));

  const statusData = ADMIN_METRICS.byStatus.map((s) => ({
    name: STATUS_LABELS[s.status],
    value: s.count,
    fill: STATUS_COLORS[s.status],
  }));

  const trendData = ADMIN_METRICS.weeklyTrend;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Civic Impact Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your civic engagement metrics and community impact.</p>
      </div>

      {/* Citizen metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Schemes Discovered', value: DASHBOARD_STATS.schemesDiscovered, icon: Search, color: 'text-blue-500' },
          { label: 'Applications Prepared', value: DASHBOARD_STATS.applicationsPrepared, icon: FileText, color: 'text-accent' },
          { label: 'Documents Completed', value: DASHBOARD_STATS.documentsCompleted, icon: FileCheck, color: 'text-success' },
          { label: 'Complaints Resolved', value: DASHBOARD_STATS.complaintsResolved, icon: CheckCircle2, color: 'text-purple-500' },
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

      {/* Civic Impact Score */}
      <Card className="border-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-foreground">Civic Impact Score</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">A measure of your civic engagement and contribution</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-accent">{DASHBOARD_STATS.civicImpactScore}</div>
              <Progress value={DASHBOARD_STATS.civicImpactScore} className="mt-1 h-2 w-40" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Complaints Submitted</div>
              <div className="text-lg font-bold text-foreground">{DASHBOARD_STATS.complaintsSubmitted}</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Complaints Resolved</div>
              <div className="text-lg font-bold text-success">{DASHBOARD_STATS.complaintsResolved}</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Avg Resolution Time</div>
              <div className="text-lg font-bold text-foreground">{DASHBOARD_STATS.avgResolutionTime}</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Resolution Rate</div>
              <div className="text-lg font-bold text-success">{ADMIN_METRICS.resolutionRate}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Civic Pulse */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base">AI Civic Pulse</CardTitle>
              <CardDescription>AI-generated summary of civic issues from anonymized complaint data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
            {ADMIN_METRICS.civicPulse}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Complaint Trends</CardTitle>
            <CardDescription>Complaints filed vs resolved over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" style={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="complaints" stroke="hsl(25 95% 53%)" strokeWidth={2} name="Complaints" />
                <Line type="monotone" dataKey="resolved" stroke="hsl(160 84% 39%)" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaints by Category</CardTitle>
            <CardDescription>Distribution of civic issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" style={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} stroke="hsl(var(--muted-foreground))" style={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaint Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emerging issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" /> Emerging Civic Problems
            </CardTitle>
            <CardDescription>AI-detected trends in community issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ADMIN_METRICS.emergingIssues.map((issue, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">{issue.title}</div>
                    <div className="text-xs text-muted-foreground">{issue.count} reports</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {issue.trend === 'up' && <TrendingUp className="h-4 w-4 text-destructive" />}
                    {issue.trend === 'down' && <TrendingDown className="h-4 w-4 text-success" />}
                    {issue.trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
                    <Badge variant={issue.trend === 'up' ? 'destructive' : issue.trend === 'down' ? 'default' : 'secondary'} className="text-[10px]">
                      {issue.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
