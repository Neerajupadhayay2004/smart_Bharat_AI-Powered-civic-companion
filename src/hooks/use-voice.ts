import { useState, useRef, useCallback } from 'react';
import type { Language } from '@/lib/i18n';
import { LANGUAGE_CODES } from '@/lib/i18n';

export interface VoiceState {
  listening: boolean;
  speaking: boolean;
  supported: boolean;
  transcript: string;
}

export function useVoice(language: Language = 'en') {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const langCode = LANGUAGE_CODES[language] ?? 'en-IN';

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
    'speechSynthesis' in window;

  const startListening = useCallback(
    (onResult: (text: string) => void, onError?: (e: any) => void) => {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SR) {
        onError?.('Speech recognition not supported');
        return;
      }

      const recognition = new SR();
      recognition.lang = langCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        onResult(text);
        setListening(false);
      };

      recognition.onerror = (event: any) => {
        setListening(false);
        onError?.(event.error);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
      setTranscript('');
    },
    [langCode]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [langCode]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const toggle = useCallback(
    (onResult: (text: string) => void) => {
      if (listening) {
        stopListening();
      } else {
        startListening(onResult);
      }
    },
    [listening, startListening, stopListening]
  );

  return {
    listening,
    speaking,
    supported,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggle,
  };
}
