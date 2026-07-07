import { useState, useEffect, useCallback } from 'react';
import { Mic, X, Volume2, Square, Sparkles, Globe } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useVoice } from '@/hooks/use-voice';
import { processAIQuery } from '@/lib/ai-service';
import { navigate } from '@/lib/router';
import { LANGUAGE_NAMES, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceExchange {
  id: string;
  userText: string;
  aiText: string;
}

const LANGUAGES = Object.keys(LANGUAGE_NAMES) as Language[];

export function VoiceAssistant() {
  const { language, setLanguage, voiceEnabled, profile } = useApp();
  const voice = useVoice(language);
  const [open, setOpen] = useState(false);
  const [exchanges, setExchanges] = useState<VoiceExchange[]>([]);
  const [thinking, setThinking] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSpoken = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setThinking(true);
      try {
        const response = await processAIQuery(text, {
          messages: [],
          profile: profile ?? undefined,
          language,
        });
        const aiText = response.content;
        setExchanges((prev) => [...prev, { id: crypto.randomUUID(), userText: text, aiText }]);
        if (voiceEnabled) voice.speak(aiText);
      } catch {
        setExchanges((prev) => [
          ...prev,
          { id: crypto.randomUUID(), userText: text, aiText: 'Sorry, I could not process that.' },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [profile, language, voice, voiceEnabled]
  );

  const startListening = () => {
    voice.startListening(handleSpoken);
  };

  useEffect(() => {
    if (!open) {
      voice.stopSpeaking();
      voice.stopListening();
    }
  }, [open]);

  if (!voice.supported) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl active:scale-95',
          'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
        aria-label="Open Voice Assistant"
      >
        <Mic className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-accent" />
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bharat-gradient">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Voice Assistant</h2>
                  <p className="text-xs text-muted-foreground">
                    {LANGUAGE_NAMES[language]} · {voice.listening ? 'Listening...' : voice.speaking ? 'Speaking...' : 'Tap mic to speak'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowLangPicker(!showLangPicker)}
                >
                  <Globe className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Language picker */}
            {showLangPicker && (
              <div className="mb-4 grid grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLangPicker(false);
                    }}
                    className={cn(
                      'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                      language === lang
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {LANGUAGE_NAMES[lang]}
                  </button>
                ))}
              </div>
            )}

            {/* Conversation area */}
            <div className="mb-4 max-h-[40vh] space-y-3 overflow-y-auto">
              {exchanges.length === 0 && !thinking && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Speak to Bharat AI</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ask about schemes, eligibility, or report an issue — in your language.
                  </p>
                </div>
              )}

              {exchanges.map((ex) => (
                <div key={ex.id} className="space-y-2">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {ex.userText}
                  </div>
                  <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground">
                    {ex.aiText}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Mic button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={voice.listening ? voice.stopListening : startListening}
                disabled={thinking}
                className={cn(
                  'flex h-20 w-20 items-center justify-center rounded-full transition-all disabled:opacity-50',
                  voice.listening
                    ? 'bg-destructive text-destructive-foreground scale-110'
                    : 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
                )}
                aria-label={voice.listening ? 'Stop listening' : 'Start speaking'}
              >
                {voice.listening ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
                {voice.listening && (
                  <span className="absolute flex h-20 w-20 animate-ping rounded-full bg-destructive/30" />
                )}
              </button>

              <div className="flex items-center gap-2">
                {voice.speaking && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={voice.stopSpeaking}
                    className="gap-1.5"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Stop Voice
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/chat')}
                  className="text-xs text-muted-foreground"
                >
                  Switch to Text Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
