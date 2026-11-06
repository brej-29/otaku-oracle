export type QuestionKind = "fact" | "news" | "discussion" | "unclear";
export type EvidenceField =
  | "studio"
  | "episodes"
  | "year"
  | "format"
  | "source"
  | "season"
  | "status"
  | "duration"
  | "start_date"
  | "end_date"
  | "genres"
  | "producers"
  | "voice_cast"
  | "relations"
  | "next_episode"
  | "popularity"
  | "trending"
  | "streaming"
  | "external_links"
  | "main_characters"
  | "network";
export type SourceState =
  | "available"
  | "stale"
  | "unavailable"
  | "rate-limited"
  | "not-matched"
  | "link-only";
export interface SourceInfo {
  id: string;
  label: string;
  state: SourceState;
  url: string;
  fetchedAt: string | null;
  cached: boolean;
  note: string | null;
}
export interface Evidence {
  sourceId: string;
  source: string;
  value: string;
  url: string;
  fetchedAt: string;
  stale: boolean;
}
export interface Verification {
  field: EvidenceField;
  basis:
    | "agreement"
    | "single-source"
    | "sources-disagree"
    | "claim-disagrees"
    | "insufficient"
    | "stale";
  evidence: Evidence[];
  note: string;
}
export interface RelatedLink {
  kind: "news" | "discussion" | "search" | "reference";
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  score: number | null;
  scoreKind: "replies" | null;
  label: string;
}
export interface SourcePayload {
  source: SourceInfo;
  facts: Partial<Record<EvidenceField, string>>;
  links: RelatedLink[];
}
export interface SourceExtension {
  questionKind: QuestionKind;
  resolution: {
    status: "verified" | "conflict" | "unchecked" | "discussion";
    summary: string;
  };
  sources: SourceInfo[];
  related: RelatedLink[];
}
