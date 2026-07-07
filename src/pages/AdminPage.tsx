import { ADMIN_METRICS, COMPLAINT_CATEGORY_LABELS, STATUS_LABELS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { navigate } from '@/lib/router';
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  resolved: 'hsl(160 84% 39%)',
  in_progress: 'hsl(38 92% 50%)',
  under_review: 'hsl(200 80% 50%)',
  submitted: 'hsl(222 15% 60%)',
  escalated: 'hsl(0 72% 51%)',
};

export function AdminPage() {
  const categoryData = ADMIN_METRICS.byCategory.map((c) => ({
    name: COMPLAINT_CATEGORY_LABELS[c.category],
    count: c.count,
  }));

  const statusData = ADMIN_METRICS.byStatus.map((s) => ({
    name: STATUS_LABELS[s.status],
    value: s.count,
    fill: STATUS_COLORS[s.status],
  }));

  const trendData = ADMIN_METRICS.weeklyTrend;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Admin / Authority Dashboard</h1>
          </div>
          <p className="mt-1 text-muted-foreground">Demo authority view — analytics, workload, and AI insights</p>
        </div>
        <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
          <Shield className="h-3 w-3" /> Authority View
        </Badge>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Complaints', value: ADMIN_METRICS.totalComplaints, icon: AlertTriangle, color: 'text-accent' },
          { label: 'Resolution Rate', value: `${ADMIN_METRICS.resolutionRate}%`, icon: CheckCircle2, color: 'text-success' },
          { label: 'Active Departments', value: ADMIN_METRICS.departmentWorkload.length, icon: Building2, color: 'text-blue-500' },
          { label: 'Emerging Issues', value: ADMIN_METRICS.emergingIssues.length, icon: TrendingUp, color: 'text-warning' },
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

      {/* AI Civic Pulse */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base">AI Civic Pulse — Authority Summary</CardTitle>
              <CardDescription>AI-generated insights from anonymized complaint data</CardDescription>
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
        {/* Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaint & Resolution Trends</CardTitle>
            <CardDescription>6-week overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(25 95% 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(25 95% 53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" style={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Legend />
                <Area type="monotone" dataKey="complaints" stroke="hsl(25 95% 53%)" fill="url(#compGrad)" strokeWidth={2} name="Complaints" />
                <Area type="monotone" dataKey="resolved" stroke="hsl(160 84% 39%)" fill="url(#resGrad)" strokeWidth={2} name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Distribution</CardTitle>
            <CardDescription>All complaints by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
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

        {/* Category bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(25 95% 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department workload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department Workload</CardTitle>
            <CardDescription>Complaints assigned and avg resolution time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ADMIN_METRICS.departmentWorkload.map((dept, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{dept.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">{dept.count} complaints</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" /> {dept.avgDays}d avg
                      </span>
                    </div>
                  </div>
                  <Progress value={(dept.count / 112) * 100} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emerging issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-warning" /> Emerging Civic Problems
          </CardTitle>
          <CardDescription>AI-detected trends requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {ADMIN_METRICS.emergingIssues.map((issue, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{issue.title}</div>
                  <div className="text-xs text-muted-foreground">{issue.count} reports this week</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {issue.trend === 'up' && <TrendingUp className="h-5 w-5 text-destructive" />}
                  {issue.trend === 'down' && <TrendingDown className="h-5 w-5 text-success" />}
                  {issue.trend === 'stable' && <Minus className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => navigate('/impact')}>
          View Citizen Impact Dashboard
        </Button>
      </div>
    </div>
  );
}
