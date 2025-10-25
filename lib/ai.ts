import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';

export type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface SentimentResult {
  score: number;        // normalized between -1 and 1
  label: SentimentLabel;
  confidence: number;   // 0..1
}

const openaiApiKey = process.env.OPENAI_API_KEY;
const hfToken = process.env.HF_ACCESS_TOKEN;

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const hf = hfToken ? new HfInference(hfToken) : null;

// Normalize label variants to our enum
function normalizeLabel(raw: string): SentimentLabel {
  const v = raw.toLowerCase();
  if (v.includes('pos')) return 'POSITIVE';
  if (v.includes('neg')) return 'NEGATIVE';
  return 'NEUTRAL';
}

function clamp(n: number, min = -1, max = 1) {
  return Math.max(min, Math.min(max, n));
}

// Heuristic fallback using simple keyword lexicon
function heuristicSentiment(text: string): SentimentResult {
  const positiveWords = ['good','great','excellent','amazing','love','fantastic','happy','satisfied','awesome','perfect'];
  const negativeWords = ['bad','terrible','awful','hate','poor','angry','unsatisfied','horrible','worst','disappointed'];
  const tokens = text.toLowerCase().split(/[^a-zA-Z]+/);
  let score = 0;
  for (const t of tokens) {
    if (!t) continue;
    if (positiveWords.includes(t)) score += 1;
    if (negativeWords.includes(t)) score -= 1;
  }
  const normalized = clamp(score / Math.max(1, tokens.length / 10));
  const label: SentimentLabel = normalized > 0.15 ? 'POSITIVE' : normalized < -0.15 ? 'NEGATIVE' : 'NEUTRAL';
  const confidence = Math.min(1, Math.abs(normalized));
  return { score: normalized, label, confidence };
}

// OpenAI primary analyzer
async function analyzeWithOpenAI(text: string): Promise<SentimentResult | null> {
  if (!openai) return null;
  try {
    const prompt = `You are a precise sentiment analyzer. Analyze the user's review and respond ONLY as strict JSON with keys: score (float -1..1), label (POSITIVE|NEGATIVE|NEUTRAL), confidence (0..1). Review: "${text.replace(/"/g, '\\"')}"`;

    const resp = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
    });

    const content = resp.output_text?.trim() || '';
    let json: any;
    try { json = JSON.parse(content); } catch {
      // try to extract JSON
      const match = content.match(/\{[\s\S]*\}/);
      if (match) json = JSON.parse(match[0]); else throw new Error('Invalid JSON from OpenAI');
    }
    const score = clamp(Number(json.score));
    const label = normalizeLabel(String(json.label || 'NEUTRAL'));
    const confidence = Math.max(0, Math.min(1, Number(json.confidence ?? Math.abs(score))));
    return { score, label, confidence };
  } catch (e) {
    console.warn('OpenAI analysis failed, falling back:', e);
    return null;
  }
}

// HuggingFace fallback using sentiment-analysis pipeline
async function analyzeWithHF(text: string): Promise<SentimentResult | null> {
  if (!hf) return null;
  try {
    const result = await hf.textClassification({
      model: 'distilbert-base-uncased-finetuned-sst-2-english',
      inputs: text,
    });
    const top = Array.isArray(result) ? result[0] : result;
    const label = normalizeLabel(String(top.label || 'NEUTRAL'));
    const rawScore = typeof top.score === 'number' ? top.score : 0.5;
    const score = label === 'POSITIVE' ? rawScore : label === 'NEGATIVE' ? -rawScore : 0;
    const confidence = Math.max(0, Math.min(1, rawScore));
    return { score: clamp(score), label, confidence };
  } catch (e) {
    console.warn('HuggingFace analysis failed, falling back:', e);
    return null;
  }
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Try OpenAI
  const o = await analyzeWithOpenAI(text);
  if (o) return o;
  // Try HF
  const h = await analyzeWithHF(text);
  if (h) return h;
  // Heuristic
  return heuristicSentiment(text);
}
