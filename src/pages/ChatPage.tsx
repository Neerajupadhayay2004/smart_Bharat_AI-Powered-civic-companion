import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { useVoice } from '@/hooks/use-voice';
import { processAIQuery, type AIResponse } from '@/lib/ai-service';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Shield,
  ExternalLink,
  Lightbulb,
  Trash2,
} from 'lucide-react';

const SUGGESTED = [
  'I am a 20-year-old engineering student from Bihar. My family income is ₹2 lakh per year. Which scholarships can I apply for?',
  'I am a farmer with 2 acres of land. What government schemes can help me?',
  'There is an overflowing garbage dump near my house. How do I report it?',
  'What pension schemes are available for senior citizens?',
  'How do I apply for Ayushman Bharat health insurance?',
];

export function ChatPage() {
  const { chatMessages, addChatMessage, setChatMessages, profile, language, voiceEnabled } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTransparency, setExpandedTransparency] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const voice = useVoice(language);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage({
        id: 'welcome-chat',
        role: 'assistant',
        content: "Namaste! I'm Bharat AI. I can help you discover government schemes, check eligibility, prepare documents, and report civic issues — all in your language.\n\nTell me about yourself (age, state, occupation, income) and I'll recommend relevant schemes. Or ask me anything about government services!",
        timestamp: new Date().toISOString(),
        language: 'en',
      });
    }
  }, []);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const response: AIResponse = await processAIQuery(query, {
        messages: [...chatMessages, userMsg],
        profile: profile || undefined,
        language,
      });

      addChatMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        confidence: response.confidence,
        intent: response.intent,
        language: response.language,
        actions: response.actions,
        transparency: response.transparency,
      });
    } catch {
      addChatMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, I encountered an issue. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    if (!voice.supported) {
      alert('Voice input not supported. Try Chrome or Edge.');
      return;
    }
    voice.toggle((text) => setInput(text));
  };

  const speakText = (text: string) => {
    if (voiceEnabled) voice.speak(text);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bharat AI Chat</h1>
          <p className="text-sm text-muted-foreground">Your AI Civic Companion — RAG-powered, source-backed, multilingual</p>
        </div>
        {chatMessages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={() => setChatMessages([])}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="space-y-4 p-4">
            {chatMessages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onSpeak={speakText}
                expanded={expandedTransparency}
                setExpanded={setExpandedTransparency}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
                </div>
                Bharat AI is analyzing your query...
              </div>
            )}
          </div>
        </ScrollArea>

        {chatMessages.length <= 1 && (
          <div className="border-t p-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">SUGGESTED QUERIES</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                >
                  {q.length > 60 ? q.slice(0, 60) + '...' : q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn('shrink-0', voice.listening && 'bg-destructive/10 text-destructive')}
              onClick={handleVoice}
            >
              <Mic className={cn('h-4 w-4', voice.listening && 'animate-pulse')} />
            </Button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="Type your question in English, Hindi, or Hinglish..."
              className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              rows={1}
              style={{ maxHeight: '100px' }}
            />
            <Button size="icon" className="shrink-0 bg-accent hover:bg-accent/90" onClick={() => handleSend()} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ChatBubble({
  message,
  onSpeak,
  expanded,
  setExpanded,
}: {
  message: ChatMessage;
  onSpeak: (t: string) => void;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}) {
  const isUser = message.role === 'user';
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bharat-gradient">
        <Sparkles className="h-4 w-4" style={{ color: 'hsl(25 95% 60%)' }} />
      </div>
      <div className="max-w-[80%] space-y-2">
        <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-3 text-sm">
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => onSpeak(message.content)} className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted">
            <Volume2 className="h-3 w-3" /> Listen
          </button>
          {message.actions?.map((a) => (
            <button key={a.id} onClick={() => a.target && navigate(a.target)} className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/20">
              <Lightbulb className="h-3 w-3" /> {a.label}
            </button>
          ))}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Shield className="h-3.5 w-3.5 text-success" /> Verified Sources ({message.sources.length})
            </div>
            {message.sources.map((src, i) => (
              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 text-xs text-muted-foreground hover:text-foreground">
                <span className="truncate">{src.title}</span>
                <span className="flex items-center gap-1 shrink-0"><span className="text-success">✓</span><ExternalLink className="h-3 w-3" /></span>
              </a>
            ))}
            <div className="text-[10px] text-muted-foreground">Last verified: {message.sources[0].lastVerified}</div>
          </div>
        )}

        {message.confidence !== undefined && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className={cn('h-1.5 w-1.5 rounded-full', message.confidence > 0.7 ? 'bg-success' : message.confidence > 0.4 ? 'bg-warning' : 'bg-destructive')} />
              Confidence: {Math.round(message.confidence * 100)}%
            </span>
            {message.transparency && (
              <button onClick={() => setExpanded(expanded === message.id ? null : message.id)} className="flex items-center gap-0.5 hover:text-foreground">
                How AI reached this {expanded === message.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}

        {message.transparency && expanded === message.id && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-xs">
            <div>
              <div className="font-semibold text-foreground">User information considered:</div>
              <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                {message.transparency.userInfoConsidered.map((info, i) => <li key={i}>{info}</li>)}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-foreground">Eligibility rules matched:</div>
              <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                {message.transparency.rulesMatched.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-foreground">Sources retrieved:</div>
              <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                {message.transparency.sourcesRetrieved.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {message.transparency.uncertainties.length > 0 && (
              <div>
                <div className="font-semibold text-warning">Uncertainties:</div>
                <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                  {message.transparency.uncertainties.map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </div>
            )}
            <div className="border-t pt-1.5 text-muted-foreground">
              <span className="font-semibold text-foreground">Reasoning: </span>{message.transparency.reasoning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
