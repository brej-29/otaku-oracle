export type Field =
  | "studio"
  | "episodes"
  | "year"
  | "format"
  | "source"
  | "season";
export const FIELDS: Field[] = [
  "studio",
  "episodes",
  "year",
  "format",
  "source",
  "season",
];
export interface AnimeRecord {
  id: number;
  title: string;
  native: string | null;
  format: string | null;
  episodes: number | null;
  studios: string[];
  year: number | null;
  season: string | null;
  seasonYear: number | null;
  source: string | null;
  cover: string | null;
  color: string | null;
  url: string;
  genres: string[];
}
export interface Claim {
  id: string;
  text: string;
  field: Field | null;
  value: string | null;
  status: "verified" | "conflict" | "unchecked";
  recordValue: string | null;
  sourceUrl: string;
}
export interface DraftClaim {
  text: string;
  field: Field | null;
  value: string | null;
}
export interface Draft {
  answer: string;
  claims: DraftClaim[];
  explanation: string | null;
}
export interface Provider {
  id: string;
  baseUrl: string;
  keyEnv: string;
  models: string[];
  freeModels: string[];
  discovery?: boolean;
  maxTokens: number;
  tokenParameter?: string;
  options: Record<string, unknown>;
  notes?: string;
}
export interface Env {
  DB: D1Database;
  SITE_ORIGIN: string;
  IP_HASH_SECRET: string;
  CLIENT_DAILY_LIMIT: string;
  MODEL_DAILY_BUDGET: string;
  PROVIDER_COOLDOWN_SECONDS: string;
  PROVIDERS_JSON?: string;
  ZAI_API_KEY?: string;
  GROQ_API_KEY?: string;
  NVIDIA_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
}
export type Fetcher = typeof fetch;
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public retryAfter?: number,
  ) {
    super(code);
  }
}
export interface Answer {
  title: string;
  record: AnimeRecord;
  fetchedAt: string;
  recordCached: boolean;
  mode: "model" | "record-only";
  model: { id: string; provider: string } | null;
  claims: Claim[];
  explanation: string | null;
  quota: { state: "ok" | "degraded" | "exhausted" };
  notice: string | null;
}
