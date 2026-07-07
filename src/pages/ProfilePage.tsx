import { useApp } from '@/lib/app-context';
import { DEMO_PERSONAS } from '@/lib/seed-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { navigate } from '@/lib/router';
import { User, MapPin, Briefcase, IndianRupee, GraduationCap, Wheat, Home, LogOut, Edit } from 'lucide-react';

export function ProfilePage() {
  const { profile, persona, setPersona } = useApp();
  const personaData = persona ? DEMO_PERSONAS.find((p) => p.id === persona) : null;

  const handleSignOut = () => {
    setPersona(null);
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Your citizen profile and preferences</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className={`text-2xl ${personaData ? `bg-gradient-to-br ${personaData.color} text-white` : 'bg-muted'}`}>
                {personaData?.avatar || '👤'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{personaData?.name || 'Guest Citizen'}</h2>
              <p className="text-sm text-muted-foreground">{personaData?.role || 'Citizen'}</p>
              {personaData && (
                <Badge variant="secondary" className="mt-1">{personaData.state}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.age && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Age</div>
                    <div className="font-medium">{profile.age} years</div>
                  </div>
                </div>
              )}
              {profile.state && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">State</div>
                    <div className="font-medium">{profile.state}{profile.district ? `, ${profile.district}` : ''}</div>
                  </div>
                </div>
              )}
              {profile.occupation && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Occupation</div>
                    <div className="font-medium">{profile.occupation}</div>
                  </div>
                </div>
              )}
              {profile.incomeRange && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Income Range</div>
                    <div className="font-medium">₹{profile.incomeRange}/year</div>
                  </div>
                </div>
              )}
              {profile.isStudent && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Student</div>
                    <div className="font-medium">Yes</div>
                  </div>
                </div>
              )}
              {profile.isFarmer && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Wheat className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Farmer</div>
                    <div className="font-medium">Yes</div>
                  </div>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Location Type</div>
                    <div className="font-medium capitalize">{profile.location}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {personaData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demo Persona Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{personaData.description}</p>
            <div className="mt-3">
              <div className="text-xs font-medium text-muted-foreground">SUGGESTED AI QUERY</div>
              <div className="mt-1 rounded-lg bg-muted p-3 text-sm text-foreground">"{personaData.suggestedQuery}"</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={() => navigate('/settings')}>
          Accessibility & Language Settings
        </Button>
      </div>
    </div>
  );
}
