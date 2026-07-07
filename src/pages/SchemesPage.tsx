import { useState, useMemo } from 'react';
import { useApp } from '@/lib/app-context';
import { navigate } from '@/lib/router';
import { SCHEMES, CATEGORY_LABELS } from '@/lib/seed-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Shield, ArrowRight, Sparkles } from 'lucide-react';
import type { SchemeCategory } from '@/lib/types';

const CATEGORIES: (SchemeCategory | 'all')[] = ['all', 'education', 'agriculture', 'pension', 'welfare', 'employment', 'health', 'housing', 'finance'];

const CATEGORY_ICONS: Record<string, string> = {
  education: '🎓',
  agriculture: '🌾',
  pension: '👴',
  welfare: '🤝',
  employment: '💼',
  health: '🏥',
  housing: '🏠',
  finance: '💰',
};

export function SchemesPage() {
  const { setCopilotOpen } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SchemeCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      const matchCat = category === 'all' || s.category === category;
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some((t) => t.includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scheme Explorer</h1>
        <p className="mt-1 text-muted-foreground">
          Discover {SCHEMES.length}+ government schemes and services. AI-powered recommendations available.
        </p>
      </div>

      {/* AI Recommendation banner */}
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bharat-gradient">
            <Sparkles className="h-5 w-5" style={{ color: 'hsl(25 95% 60%)' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Get AI-personalized recommendations</div>
            <div className="text-xs text-muted-foreground">Tell Bharat AI about yourself and get ranked scheme matches</div>
          </div>
          <Button className="gap-2 bg-accent hover:bg-accent/90" onClick={() => setCopilotOpen(true)}>
            <Sparkles className="h-4 w-4" /> Ask AI
          </Button>
        </CardContent>
      </Card>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schemes by name, keyword, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {cat !== 'all' && <span>{CATEGORY_ICONS[cat]}</span>}
              {cat === 'all' ? 'All Schemes' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((scheme) => (
          <Card
            key={scheme.id}
            className="group cursor-pointer transition-all hover:border-accent hover:shadow-md"
            onClick={() => navigate(`/schemes/${scheme.id}`)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">
                  {CATEGORY_ICONS[scheme.category]}
                </div>
                <Badge variant="secondary" className="text-[10px]">{CATEGORY_LABELS[scheme.category]}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-foreground group-hover:text-accent">{scheme.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{scheme.shortDescription}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-success" />
                <span className="truncate">{scheme.department}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-success">✓ Verified {scheme.lastVerified}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Filter className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No schemes found. Try a different search or category.</p>
        </div>
      )}
    </div>
  );
}
