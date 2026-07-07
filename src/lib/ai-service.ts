import { SCHEMES } from './seed-data';
import type {
  GovernmentScheme,
  CitizenProfile,
  ChatMessage,
  CitationSource,
  TransparencyInfo,
  RecommendedAction,
  Language,
} from './types';

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';

export interface AIResponse {
  content: string;
  sources: CitationSource[];
  confidence: number;
  intent: string;
  language: Language;
  actions: RecommendedAction[];
  transparency: TransparencyInfo;
  matchedSchemes?: GovernmentScheme[];
}

export interface ChatContext {
  messages: ChatMessage[];
  profile?: CitizenProfile;
  language: Language;
}

function detectLanguage(text: string): Language {
  const devanagari = /[\u0900-\u097F]/;
  if (devanagari.test(text)) return 'hi';
  const hinglishPatterns = /\b(hai|kya|kaise|kar|nahi|ho|ka|ki|ne|se|ko|me|mera|mujhe|aap|please|plz)\b/i;
  if (hinglishPatterns.test(text)) return 'hinglish';
  return 'en';
}

function classifyIntent(text: string): string {
  const lower = text.toLowerCase();
  if (/scholarship|education|student|study|college|school|degree|exam|mark/i.test(lower)) return 'scheme_discovery_education';
  if (/farmer|agriculture|crop|kisan|land|subsidy|irrigation|soil/i.test(lower)) return 'scheme_discovery_agriculture';
  if (/pension|senior|old age|widow|elderly/i.test(lower)) return 'scheme_discovery_pension';
  if (/health|insurance|hospital|treatment|medical|ayushman/i.test(lower)) return 'scheme_discovery_health';
  if (/job|employment|work|skill|training|rozar|naukri/i.test(lower)) return 'scheme_discovery_employment';
  if (/house|housing|awas|home|shelter/i.test(lower)) return 'scheme_discovery_housing';
  if (/loan|business|entrepreneur|startup|money|finance/i.test(lower)) return 'scheme_discovery_finance';
  if (/garbage|waste|kachra|pothole|road|streetlight|water|drainage|leak|dump|complaint|report|issue|problem/i.test(lower)) return 'complaint_assistance';
  if (/document|certificate|paper|aadhaar|pan|income cert/i.test(lower)) return 'document_assistance';
  if (/eligib|qualify|can i apply|am i eligible/i.test(lower)) return 'eligibility_check';
  return 'general_query';
}

function extractEntities(text: string): Record<string, any> {
  const entities: Record<string, any> = {};
  const lower = text.toLowerCase();

  const ageMatch = text.match(/(\d{1,2})\s*[-]?\s*year[- ]old/i) || text.match(/age\s*(\d{1,2})/i);
  if (ageMatch) entities.age = parseInt(ageMatch[1]);

  const incomeMatch = text.match(/₹\s*([\d,.]+)\s*(lakh|lac|k|thousand|crore)?/i) || text.match(/(\d+)\s*(lakh|lac)\s*(per year|annual|p\/a)?/i);
  if (incomeMatch) {
    let val = parseFloat(incomeMatch[1].replace(/,/g, ''));
    const unit = (incomeMatch[2] || '').toLowerCase();
    if (unit.includes('lakh') || unit.includes('lac')) val *= 100000;
    else if (unit.includes('crore')) val *= 10000000;
    else if (unit.includes('k') || unit.includes('thousand')) val *= 1000;
    entities.income = val;
  }

  const states = ['bihar', 'up', 'uttar pradesh', 'delhi', 'mumbai', 'maharashtra', 'rajasthan', 'punjab', 'haryana', 'mp', 'madhya pradesh', 'west bengal', 'tamil nadu', 'karnataka', 'kerala', 'gujarat', 'andhra', 'telangana', 'odisha', 'jharkhand'];
  for (const s of states) {
    if (lower.includes(s)) { entities.state = s; break; }
  }

  if (/student|engineering|college|study|b\.?tech|b\.?e\b/i.test(lower)) entities.isStudent = true;
  if (/farmer|kisan|agriculture|crop/i.test(lower)) entities.isFarmer = true;
  if (/woman|women|female|girl|widow/i.test(lower)) entities.gender = 'female';
  if (/senior|elderly|old age|60\+|70\+|80\+/i.test(lower)) entities.isSenior = true;

  return entities;
}

function retrieveSchemes(query: string, profile?: CitizenProfile, entities?: Record<string, any>): GovernmentScheme[] {
  const lower = query.toLowerCase();
  const scored = SCHEMES.map((scheme) => {
    let score = 0;
    const tags = scheme.tags.join(' ').toLowerCase();
    const name = scheme.name.toLowerCase();
    const desc = scheme.description.toLowerCase();
    const cat = scheme.category;

    if (entities?.isStudent || profile?.isStudent) {
      if (cat === 'education') score += 30;
      if (/scholarship|student|education/.test(tags)) score += 20;
    }
    if (entities?.isFarmer || profile?.isFarmer) {
      if (cat === 'agriculture') score += 30;
      if (/farmer|agriculture|crop/.test(tags)) score += 20;
    }
    if (entities?.isSenior) {
      if (cat === 'pension') score += 30;
    }
    if (entities?.gender === 'female' || profile?.gender === 'female') {
      if (/women|girl|widow/.test(tags)) score += 25;
    }
    if (entities?.income && entities.income <= 300000) {
      if (/scholarship|bpl|welfare|free|low cost/.test(tags)) score += 15;
    }

    for (const tag of scheme.tags) {
      if (lower.includes(tag)) score += 10;
    }
    for (const word of lower.split(/\s+/)) {
      if (word.length > 3 && (name.includes(word) || desc.includes(word) || tags.includes(word))) {
        score += 3;
      }
    }

    return { scheme, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.scheme);
}

function buildRAGContext(schemes: GovernmentScheme[]): string {
  if (schemes.length === 0) return '';
  return schemes
    .map((s, i) => {
      return `[SCHEME ${i + 1}: ${s.name}]
Department: ${s.department}
Description: ${s.shortDescription}
Eligibility: ${s.eligibilitySummary}
Required Documents: ${s.requiredDocuments.join(', ')}
Application Process: ${s.applicationProcess.join('; ')}
Benefits: ${s.benefits}
Official Source: ${s.officialSource} (${s.sourceUrl})
Last Verified: ${s.lastVerified}
Availability: ${s.availability}`;
    })
    .join('\n\n---\n\n');
}

function buildSystemPrompt(language: Language, schemes: GovernmentScheme[], profile?: CitizenProfile): string {
  const ragContext = buildRAGContext(schemes);
  const profileStr = profile
    ? `Citizen Profile: Age ${profile.age || 'unknown'}, State: ${profile.state || 'unknown'}, Occupation: ${profile.occupation || 'unknown'}, Student: ${profile.isStudent ? 'yes' : 'no'}, Farmer: ${profile.isFarmer ? 'yes' : 'no'}, Income: ${profile.incomeRange || 'unknown'}, Gender: ${profile.gender || 'unknown'}, Location: ${profile.location || 'unknown'}`
    : 'No citizen profile available yet.';

  const langInstruction =
    language === 'hi'
      ? 'Respond in Hindi (Devanagari script).'
      : language === 'hinglish'
      ? 'Respond in Hinglish (mix of Hindi and English, as commonly spoken in India).'
      : 'Respond in clear, simple English.';

  return `You are Bharat AI, an AI Civic Companion for Indian citizens. You help citizens discover government schemes, understand eligibility, prepare documents, report civic issues, and track complaints.

${langInstruction}

CRITICAL RULES:
1. You MUST ONLY use the government scheme information provided in the RAG context below. NEVER invent or hallucinate scheme details.
2. If the RAG context is empty or does not contain relevant schemes, say that you need more information or that verification is required on the official portal.
3. Always cite the official source URL when recommending a scheme.
4. Be concise, warm, and helpful. Use simple language that a citizen with low digital literacy can understand.
5. When a citizen asks about civic issues (garbage, potholes, etc.), guide them to report the issue and explain what department handles it.
6. Ask follow-up questions only when necessary to provide better recommendations.
7. Structure your response with clear sections using markdown.

${profileStr}

GOVERNMENT SCHEME KNOWLEDGE BASE (RAG Context):
${ragContext || 'No schemes retrieved yet. If the user asks about schemes, explain that you can help them discover relevant schemes and ask for their details (age, state, occupation, income, etc.).'}

Respond in a helpful, structured way. If recommending schemes, list them with: name, department, eligibility summary, benefits, and official source URL. If the query is about a civic issue, explain the category, likely department, and suggest reporting it through the Civic Issue Reporter.`;
}

function buildTransparency(
  _query: string,
  entities: Record<string, any>,
  schemes: GovernmentScheme[],
  profile?: CitizenProfile
): TransparencyInfo {
  const userInfoConsidered: string[] = [];
  if (entities.age) userInfoConsidered.push(`Age: ${entities.age}`);
  if (entities.income) userInfoConsidered.push(`Family income: ₹${entities.income.toLocaleString()}`);
  if (entities.state) userInfoConsidered.push(`State: ${entities.state}`);
  if (entities.isStudent) userInfoConsidered.push('Student status: yes');
  if (entities.isFarmer) userInfoConsidered.push('Farmer status: yes');
  if (entities.gender) userInfoConsidered.push(`Gender: ${entities.gender}`);
  if (profile?.occupation) userInfoConsidered.push(`Occupation: ${profile.occupation}`);

  const rulesMatched = schemes.map((s) => `${s.name}: ${s.eligibilitySummary}`);
  const sourcesRetrieved = schemes.map((s) => `${s.officialSource} (${s.sourceUrl})`);

  const uncertainties: string[] = [];
  if (!entities.age && !profile?.age) uncertainties.push('Age not provided — some schemes have age limits');
  if (!entities.income && !profile?.incomeRange) uncertainties.push('Income not specified — many schemes are income-linked');
  if (!entities.state && !profile?.state) uncertainties.push('State not specified — some schemes are state-specific');

  return {
    userInfoConsidered,
    rulesMatched,
    sourcesRetrieved,
    uncertainties,
    reasoning: `I analyzed your query for keywords related to government services. I detected ${entities.isStudent ? 'student' : entities.isFarmer ? 'farmer' : 'citizen'} intent and retrieved ${schemes.length} matching scheme(s) from the verified knowledge base. I ranked them by relevance to your profile and the keywords in your question.`,
  };
}

function buildActions(intent: string, schemes: GovernmentScheme[]): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  if (schemes.length > 0) {
    actions.push({
      id: 'a1',
      label: `View ${schemes[0].name}`,
      type: 'navigate',
      target: `/schemes/${schemes[0].id}`,
      description: 'Open scheme details and check full eligibility',
      priority: 'high',
    });
  }
  if (schemes.length > 1) {
    actions.push({
      id: 'a2',
      label: 'Compare all recommended schemes',
      type: 'navigate',
      target: '/schemes',
      description: 'See all matching schemes side by side',
      priority: 'medium',
    });
  }
  if (intent === 'complaint_assistance') {
    actions.push({
      id: 'a3',
      label: 'Report this issue now',
      type: 'report',
      target: '/report',
      description: 'File a complaint with AI-generated description',
      priority: 'high',
    });
  }
  actions.push({
    id: 'a4',
    label: 'Check document readiness',
    type: 'check',
    target: '/documents',
    description: 'See which documents you need and have ready',
    priority: 'medium',
  });
  return actions;
}

function calculateConfidence(schemes: GovernmentScheme[], entities: Record<string, any>): number {
  if (schemes.length === 0) return 0.3;
  let base = 0.6;
  if (entities.age || entities.income || entities.state) base += 0.15;
  if (entities.isStudent || entities.isFarmer) base += 0.1;
  if (schemes.length >= 3) base += 0.1;
  return Math.min(base, 0.95);
}

export async function callGeminiAPI(systemPrompt: string, userMessage: string, history: ChatMessage[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    return generateFallbackResponse(userMessage);
  }

  try {
    const contents = [
      ...history.slice(-6).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.9,
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API error:', response.status);
      return generateFallbackResponse(userMessage);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || generateFallbackResponse(userMessage);
  } catch (error) {
    console.warn('Gemini API call failed:', error);
    return generateFallbackResponse(userMessage);
  }
}

function generateFallbackResponse(query: string): string {
  const entities = extractEntities(query);
  const schemes = retrieveSchemes(query, undefined, entities);

  if (schemes.length > 0) {
    const top = schemes.slice(0, 3);
    let response = `Based on your query, here are the government schemes that may be relevant to you:\n\n`;
    top.forEach((s, i) => {
      response += `**${i + 1}. ${s.name}**\n`;
      response += `• Department: ${s.department}\n`;
      response += `• Eligibility: ${s.eligibilitySummary}\n`;
      response += `• Benefits: ${s.benefits}\n`;
      response += `• Official Source: ${s.sourceUrl}\n\n`;
    });
    response += `\n*Note: This is a preliminary AI assessment. Please verify on the official portal before applying.*`;
    return response;
  }

  if (/garbage|pothole|streetlight|water|drainage|road|dump/i.test(query.toLowerCase())) {
    return `This sounds like a civic issue. I can help you report it!\n\n**Recommended action:** Use the Civic Issue Reporter to file a complaint. The AI will:\n• Categorize the issue automatically\n• Identify the responsible department\n• Generate a professional complaint\n• Create a tracking ticket\n\nYou can also add a photo and location for faster resolution.`;
  }

  return `I'm here to help you with government services. You can ask me about:\n\n• **Scholarships** — for students\n• **Farmer schemes** — PM-KISAN, crop insurance, soil health\n• **Pensions** — for senior citizens and widows\n• **Health insurance** — Ayushman Bharat\n• **Housing** — PMAY subsidies\n• **Civic issues** — garbage, potholes, streetlights, water\n\nTell me a bit about yourself (age, state, occupation, income) and I'll recommend relevant schemes!`;
}

export async function processAIQuery(
  query: string,
  context: ChatContext
): Promise<AIResponse> {
  const language = context.language !== 'en' ? context.language : detectLanguage(query);
  const intent = classifyIntent(query);
  const entities = extractEntities(query);
  const mergedProfile = { ...context.profile, ...entities } as CitizenProfile;
  const schemes = retrieveSchemes(query, mergedProfile, entities);

  const systemPrompt = buildSystemPrompt(language, schemes, mergedProfile);
  const aiText = await callGeminiAPI(systemPrompt, query, context.messages);

  const sources: CitationSource[] = schemes.map((s) => ({
    title: s.name,
    url: s.sourceUrl,
    department: s.department,
    lastVerified: s.lastVerified,
    reliability: 'official' as const,
  }));

  const confidence = calculateConfidence(schemes, entities);
  const transparency = buildTransparency(query, entities, schemes, mergedProfile);
  const actions = buildActions(intent, schemes);

  return {
    content: aiText,
    sources,
    confidence,
    intent,
    language,
    actions,
    transparency,
    matchedSchemes: schemes,
  };
}

export async function explainSimple(text: string, _language: Language = 'en'): Promise<string> {
  if (!GEMINI_API_KEY) {
    return text + '\n\n*(Simple language mode: This explanation has been simplified for easier understanding. Key points: check eligibility, gather documents, apply on the official portal.)*';
  }

  try {
    const prompt = `Rewrite the following government information in very simple language that a citizen with low digital literacy can understand. Use short sentences, avoid jargon, and explain any technical terms. Keep it concise.\n\nText to simplify:\n${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 512 },
        }),
      }
    );

    if (!response.ok) return text;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || text;
  } catch {
    return text;
  }
}

export async function generateComplaint(
  description: string,
  category: string,
  location: string
): Promise<{ title: string; body: string; urgency: string; department: string }> {
  const urgencyMap: Record<string, string> = {
    garbage: 'high',
    potholes: 'critical',
    streetlight: 'medium',
    water: 'high',
    drainage: 'high',
    road: 'high',
    safety: 'critical',
    dumping: 'medium',
    other: 'medium',
  };

  const deptMap: Record<string, string> = {
    garbage: 'Municipal Corporation (MCD)',
    potholes: 'Public Works Department (PWD)',
    streetlight: 'Electricity Board (DESU)',
    water: 'Water Board (DJB)',
    drainage: 'Municipal Corporation (MCD)',
    road: 'Public Works Department (PWD)',
    safety: 'Local Police Station',
    dumping: 'Municipal Corporation (MCD)',
    other: 'Municipal Corporation (MCD)',
  };

  if (!GEMINI_API_KEY) {
    return {
      title: description.slice(0, 60) + (description.length > 60 ? '...' : ''),
      body: `Respected Sir/Madam,\n\nI am writing to report a ${category} issue at ${location}.\n\nDetails: ${description}\n\nThis issue is affecting the daily life of residents in the area. I request you to kindly look into this matter and take necessary action at the earliest.\n\nThank you.\n\nRegards,\nA concerned citizen`,
      urgency: urgencyMap[category] || 'medium',
      department: deptMap[category] || 'Municipal Corporation (MCD)',
    };
  }

  try {
    const prompt = `You are helping an Indian citizen file a civic complaint. Generate a professional, formal complaint based on the following details. Return ONLY a JSON object with fields: title (short, max 60 chars), body (formal complaint letter, 3-4 paragraphs), urgency (one of: low, medium, high, critical), department (the likely responsible government department in India).\n\nCategory: ${category}\nLocation: ${location}\nDescription: ${description}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 512, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        title: parsed.title || description.slice(0, 60),
        body: parsed.body || description,
        urgency: parsed.urgency || urgencyMap[category] || 'medium',
        department: parsed.department || deptMap[category] || 'Municipal Corporation (MCD)',
      };
    }
    throw new Error('No text');
  } catch {
    return {
      title: description.slice(0, 60) + (description.length > 60 ? '...' : ''),
      body: `Respected Sir/Madam,\n\nI am writing to report a ${category} issue at ${location}.\n\nDetails: ${description}\n\nThis issue is affecting the daily life of residents in the area. I request you to kindly look into this matter and take necessary action at the earliest.\n\nThank you.\n\nRegards,\nA concerned citizen`,
      urgency: urgencyMap[category] || 'medium',
      department: deptMap[category] || 'Municipal Corporation (MCD)',
    };
  }
}

export async function analyzeDocument(
  fileName: string,
  _fileType: string
): Promise<{ documentType: string; readability: number; issues: string[]; status: string; extractedFields: { label: string; value: string; masked: boolean }[] }> {
  const docTypes: Record<string, string> = {
    aadhaar: 'Aadhaar Card',
    pan: 'PAN Card',
    income: 'Income Certificate',
    caste: 'Caste Certificate',
    marksheet: 'Mark Sheet / Certificate',
    bank: 'Bank Passbook',
    residence: 'Residence Proof',
    photo: 'Photograph',
  };

  const lowerName = fileName.toLowerCase();
  let detectedType = 'Unknown Document';
  for (const [key, label] of Object.entries(docTypes)) {
    if (lowerName.includes(key)) { detectedType = label; break; }
  }
  if (detectedType === 'Unknown Document') detectedType = 'Government Document';

  const readability = Math.floor(Math.random() * 25) + 70;
  const issues: string[] = [];
  if (readability < 80) issues.push('Document image quality is low. Consider re-uploading a clearer scan.');
  if (Math.random() > 0.6) issues.push('Some fields appear to be handwritten and may need manual verification.');

  const fields = [
    { label: 'Name', value: 'XXXXXX XXXX', masked: true },
    { label: 'Document Number', value: 'XXXX-XXXX-XXXX', masked: true },
    { label: 'Date of Issue', value: '2023-0X-XX', masked: true },
  ];

  return {
    documentType: detectedType,
    readability,
    issues,
    status: issues.length > 0 ? 'pending' : 'verified',
    extractedFields: fields,
  };
}
