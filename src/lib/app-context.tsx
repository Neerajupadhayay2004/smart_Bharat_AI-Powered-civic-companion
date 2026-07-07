import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CitizenProfile, ChatMessage, Complaint, CivicJourneyEvent } from './types';
import type { Language } from './i18n';
import { SEED_COMPLAINTS, SEED_JOURNEY, DEMO_PERSONAS } from './seed-data';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;

  profile: CitizenProfile | null;
  setProfile: (profile: CitizenProfile | null) => void;

  isGuest: boolean;
  setGuest: (guest: boolean) => void;

  persona: string | null;
  setPersona: (id: string | null) => void;

  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;

  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;

  journey: CivicJourneyEvent[];
  addJourneyEvent: (event: CivicJourneyEvent) => void;

  // Accessibility
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  textScale: 'normal' | 'lg' | 'xl' | '2xl';
  setTextScale: (s: 'normal' | 'lg' | 'xl' | '2xl') => void;
  lowBandwidth: boolean;
  setLowBandwidth: (v: boolean) => void;
  accessibilityMode: boolean;
  setAccessibilityMode: (v: boolean) => void;

  // Copilot
  copilotOpen: boolean;
  setCopilotOpen: (v: boolean) => void;

  // Voice assistant global speaking
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [isGuest, setGuest] = useState(false);
  const [persona, setPersona] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [journey, setJourney] = useState<CivicJourneyEvent[]>(SEED_JOURNEY);

  const [highContrast, setHighContrast] = useState(false);
  const [textScale, setTextScale] = useState<'normal' | 'lg' | 'xl' | '2xl'>('normal');
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', highContrast);
    root.classList.remove('text-lg', 'text-xl', 'text-2xl');
    if (textScale === 'lg') root.classList.add('text-lg');
    if (textScale === 'xl') root.classList.add('text-xl');
    if (textScale === '2xl') root.classList.add('text-2xl');
    root.classList.toggle('low-bandwidth', lowBandwidth);
  }, [highContrast, textScale, lowBandwidth]);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  }, []);

  const addComplaint = useCallback((complaint: Complaint) => {
    setComplaints((prev) => [complaint, ...prev]);
  }, []);

  const updateComplaint = useCallback((id: string, updates: Partial<Complaint>) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const addJourneyEvent = useCallback((event: CivicJourneyEvent) => {
    setJourney((prev) => [event, ...prev]);
  }, []);

  const loadPersona = useCallback((id: string | null) => {
    setPersona(id);
    if (id) {
      const p = DEMO_PERSONAS.find((d) => d.id === id);
      if (p) {
        setProfile(p.profile);
        setGuest(true);
      }
    } else {
      setProfile(null);
      setGuest(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        profile,
        setProfile: (p) => { setProfile(p); if (p) setGuest(true); },
        isGuest,
        setGuest,
        persona,
        setPersona: loadPersona,
        chatMessages,
        setChatMessages,
        addChatMessage,
        complaints,
        addComplaint,
        updateComplaint,
        journey,
        addJourneyEvent,
        highContrast,
        setHighContrast,
        textScale,
        setTextScale,
        lowBandwidth,
        setLowBandwidth,
        accessibilityMode,
        setAccessibilityMode,
        copilotOpen,
        setCopilotOpen,
        voiceEnabled,
        setVoiceEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
