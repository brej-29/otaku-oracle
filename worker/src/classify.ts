import type { EvidenceField, QuestionKind } from "./source-types";
export const FIELD_TERMS: Readonly<
  Partial<Record<EvidenceField, readonly string[]>>
> = {
  studio: [
    "studio",
    "animated",
    "animator",
    "animation company",
    "who made",
    "produced",
  ],
  episodes: ["episodes", "episode count", "how many episode"],
  year: ["year"],
  format: ["format", "movie", "film", "ova", "tv series"],
  source: [
    "source material",
    "based on",
    "adapted from",
    "manga",
    "light novel",
    "original work",
  ],
  season: ["which season", "airing season"],
  status: ["status", "finished", "still airing", "completed", "cancelled"],
  duration: ["duration", "runtime", "minutes", "how long"],
  start_date: [
    "start date",
    "first aired",
    "premiere",
    "when did",
    "release date",
  ],
  end_date: ["end date", "last aired", "when did it end"],
  genres: ["genre"],
  producers: ["producer"],
  voice_cast: ["voice", "seiyuu", "cast"],
  relations: ["sequel", "prequel", "watch order", "related", "relations"],
  next_episode: ["next episode", "next airing"],
  popularity: ["popularity", "popular"],
  trending: ["trending"],
  streaming: ["watch it", "stream", "where can i watch"],
  external_links: ["official website", "official site", "external link"],
  main_characters: ["main character"],
  network: ["network", "tv channel", "broadcaster"],
};
export function classify(question: string): {
  kind: QuestionKind;
  fields: EvidenceField[];
} {
  const q = question
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/ +/g, " ");
  if (
    /\b(news|announcement|announced|rumou?r|renewed|renewal|trailer|upcoming|latest|confirmed)\b/.test(
      q,
    ) ||
    /season \d.*(when|coming|release)|when.*season \d/.test(q)
  )
    return { kind: "news", fields: [] };
  if (
    /\b(why|explain|explanation|ending|meaning|lore|theory|theories|recommend|recommendation|better|best|opinion|favorite|favourite|should|discussion|think about)\b/.test(
      q,
    )
  )
    return { kind: "discussion", fields: [] };
  let fields = (Object.keys(FIELD_TERMS) as EvidenceField[]).filter((f) =>
    FIELD_TERMS[f]!.some((t) => q.includes(t)),
  );
  if (fields.includes("next_episode"))
    fields = fields.filter((f) => f !== "episodes");
  if (fields.includes("end_date"))
    fields = fields.filter((f) => f !== "start_date");
  if (fields.includes("producers"))
    fields = fields.filter((f) => f !== "studio");
  return {
    kind: fields.length ? "fact" : "unclear",
    fields: fields.slice(0, 6),
  };
}
