import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { useVoice } from '@/hooks/use-voice';
import { processAIQuery, type AIResponse } from '@/lib/ai-service';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Send,
  Mic,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Shield,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  'I am a student from Bihar. Which scholarships can I get?',
  'What schemes are available for farmers?',
  'How do I report a garbage problem?',
  'Am I eligible for Ayushman Bharat?',
];

export function AICopilot() {
  const { copilotOpen, setCopilotOpen, chatMessages, addChatMessage, profile, language, voiceEnabled } = useApp();
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
    if (copilotOpen && chatMessages.length === 0) {
      addChatMessage({
        id: 'welcome',
        role: 'assistant',
        content: "Namaste! I'm Bharat AI, your civic companion. I can help you discover government schemes, check eligibility, prepare documents, and report civic issues. How can I help you today?",
        timestamp: new Date().toISOString(),
        language: 'en',
      });
    }
  }, [copilotOpen]);

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
    } catch (error) {
      addChatMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    if (!voice.supported) {
      alert('Voice input is not supported in your browser. Please try Chrome or Edge.');
      return;
    }
    voice.toggle((text) => setInput(text));
  };

  const speakText = (text: string) => {
    if (voiceEnabled) voice.speak(text);
  };

  if (!copilotOpen) {
    return (
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full saffron-gradient shadow-lg shadow-accent/30 transition-transform hover:scale-110"
        aria-label="Open Bharat AI Copilot"
      >
        <Sparkles className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="h-3 w-3 rounded-full bg-success" />
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col border-l bg-card shadow-2xl sm:h-[600px] sm:w-[440px] sm:bottom-6 sm:right-6 sm:rounded-2xl sm:max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between border-b bharat-gradient px-4 py-3.5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" style={{ color: 'hsl(25 95% 60%)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold">Bharat AI Copilot</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Online · RAG-powered
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setCopilotOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div ref={scrollRef} className="space-y-4">
          {chatMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onSpeak={speakText}
              expandedTransparency={expandedTransparency}
              setExpandedTransparency={setExpandedTransparency}
            />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
              </div>
              Bharat AI is thinking...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested queries */}
      {chatMessages.length <= 1 && (
        <div className="border-t px-4 py-3">
          <div className="mb-2 text-[11px] font-medium text-muted-foreground">SUGGESTED</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn('shrink-0', voice.listening && 'bg-destructive/10 text-destructive')}
            onClick={handleVoice}
            aria-label="Voice input"
          >
            <Mic className={cn('h-4 w-4', voice.listening && 'animate-pulse')} />
          </Button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about schemes, eligibility, complaints..."
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            rows={1}
            style={{ maxHeight: '100px' }}
          />
          <Button
            size="icon"
            className="shrink-0 bg-accent hover:bg-accent/90"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onSpeak,
  expandedTransparency,
  setExpandedTransparency,
}: {
  message: ChatMessage;
  onSpeak: (text: string) => void;
  expandedTransparency: string | null;
  setExpandedTransparency: (id: string | null) => void;
}) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bharat-gradient">
        <Sparkles className="h-4 w-4" style={{ color: 'hsl(25 95% 60%)' }} />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="rounded-2xl rounded-tl-md bg-muted px-4 py-2.5 text-sm">
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSpeak(message.content)}
            className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
          >
            <Volume2 className="h-3 w-3" /> Listen
          </button>
          {message.actions?.map((action) => (
            <button
              key={action.id}
              onClick={() => action.target && navigate(action.target)}
              className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/20"
            >
              <Lightbulb className="h-3 w-3" /> {action.label}
            </button>
          ))}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5 rounded-lg border bg-card p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
              <Shield className="h-3 w-3 text-success" />
              Verified Sources ({message.sources.length})
            </div>
            {message.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <span className="truncate">{src.title}</span>
                <span className="flex items-center gap-1 shrink-0">
                  <span className="text-success">✓</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </span>
              </a>
            ))}
            <div className="text-[10px] text-muted-foreground">
              Last verified: {message.sources[0].lastVerified}
            </div>
          </div>
        )}

        {/* Confidence + Transparency */}
        {message.confidence !== undefined && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  message.confidence > 0.7 ? 'bg-success' : message.confidence > 0.4 ? 'bg-warning' : 'bg-destructive'
                )}
              />
              AI confidence: {Math.round(message.confidence * 100)}%
            </span>
            {message.transparency && (
              <button
                onClick={() => setExpandedTransparency(expandedTransparency === message.id ? null : message.id)}
                className="flex items-center gap-0.5 hover:text-foreground"
              >
                How AI reached this
                {expandedTransparency === message.id ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
              </button>
            )}
          </div>
        )}

        {/* Transparency panel */}
        {message.transparency && expandedTransparency === message.id && (
          <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-[11px]">
            <div>
              <div className="font-semibold text-foreground">User information considered:</div>
              <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                {message.transparency.userInfoConsidered.map((info, i) => (
                  <li key={i}>{info}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-foreground">Eligibility rules matched:</div>
              <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                {message.transparency.rulesMatched.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-semibold text-foreground">Sources retrieved:</div>
              <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                {message.transparency.sourcesRetrieved.map((src, i) => (
                  <li key={i}>{src}</li>
                ))}
              </ul>
            </div>
            {message.transparency.uncertainties.length > 0 && (
              <div>
                <div className="font-semibold text-warning">Uncertainties:</div>
                <ul className="mt-0.5 list-inside list-disc text-muted-foreground">
                  {message.transparency.uncertainties.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border-t pt-1.5 text-muted-foreground">
              <span className="font-semibold text-foreground">Reasoning: </span>
              {message.transparency.reasoning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
