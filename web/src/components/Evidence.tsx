import type { Answer, Claim } from "../api";
import { Icon } from "./Art";
const safe = (value: string) => {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
};
export function SourceGlyph({ source }: { source: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {source === "anilist" ? (
        <>
          <path d="M4 19 10 5h3l6 14M6 15h11M19 5v14" />
        </>
      ) : source === "mal" ? (
        <>
          <path d="M4 5h5v14H4Zm6 3h4v11h-4Zm5-2 4-1 3 13-4 1Z" />
        </>
      ) : source === "wikidata" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="m5 10 4 7 3-10 3 10 4-7" />
        </>
      ) : source === "reddit" ? (
        <>
          <path d="M4 5h16v11H9l-5 4Z" />
          <path d="M8 9h8m-8 3h5" />
        </>
      ) : (
        <>
          <path d="M4 5h16v14H4Z" />
          <path d="M8 9h8m-8 4h5" />
        </>
      )}
    </svg>
  );
}
function evidenceValue(value: string) {
  try {
    const j = JSON.parse(value);
    return Array.isArray(j) ? j.join(", ") : value;
  } catch {
    return value.replace(/_/g, " ");
  }
}
export function ClaimEvidence({ claim }: { claim: Claim }) {
  const verification = claim.verification;
  if (!verification) return null;
  return (
    <div
      className={
        "evidence-trail " +
        (verification.basis === "sources-disagree" ? "evidence-dispute" : "")
      }
    >
      <p className="evidence-note">{verification.note}</p>
      <div className="evidence-values">
        {verification.evidence.map((e, i) => (
          <a
            className="evidence-value"
            key={e.sourceId + "-" + i}
            href={safe(e.url) ?? undefined}
            target="_blank"
            rel="noreferrer"
          >
            <span className="source-chip">
              <SourceGlyph source={e.sourceId} />
              {e.source}
              {e.stale && <small>stale</small>}
            </span>
            <strong>{evidenceValue(e.value)}</strong>
            <small>
              Retrieved{" "}
              {new Date(e.fetchedAt).toLocaleDateString("en", {
                dateStyle: "medium",
                timeZone: "UTC",
              })}
              <Icon size={13} />
            </small>
          </a>
        ))}
      </div>
    </div>
  );
}
export function SourceOverview({ answer }: { answer: Answer }) {
  if (!answer.sources?.length) return null;
  return (
    <section className="source-overview" aria-label="Retrieved sources">
      <div className="source-overview-title">
        <Icon name="book" />
        <h2>Meet the sources.</h2>
        <span>Agreement has a trail.</span>
      </div>
      <div className="source-presence">
        {answer.sources.map((s) => (
          <details
            key={s.id}
            className={"source-presence-item source-" + s.state}
          >
            <summary>
              <SourceGlyph source={s.id} />
              <span>
                {s.label}
                <small>
                  {s.state === "available"
                    ? s.cached
                      ? "Cached record"
                      : "Record retrieved"
                    : s.state === "link-only"
                      ? "Search links only"
                      : s.state === "stale"
                        ? "Stale record"
                        : s.state === "not-matched"
                          ? "No exact match"
                          : "Unavailable now"}
                </small>
              </span>
              <Icon
                name={s.state === "available" ? "check" : "info"}
                size={14}
              />
            </summary>
            <p>{s.note}</p>
            <a href={safe(s.url) ?? undefined} target="_blank" rel="noreferrer">
              Explore source <Icon size={13} />
            </a>
          </details>
        ))}
      </div>
    </section>
  );
}
export function RelatedShelf({ answer }: { answer: Answer }) {
  const related = answer.related;
  if (!related?.length) return null;
  const fetched = related.filter(
      (l) => l.kind === "news" || l.kind === "discussion",
    ),
    searches = related.filter(
      (l) => l.kind !== "news" && l.kind !== "discussion",
    );
  return (
    <section
      className={
        "conversation-shelf " +
        (answer.resolution?.status === "discussion"
          ? "conversation-feature"
          : "")
      }
      aria-labelledby="conversation-title"
    >
      <div className="conversation-heading">
        <SourceGlyph source="reddit" />
        <h2 id="conversation-title">
          {answer.questionKind === "news"
            ? "Follow the story."
            : "What is being said?"}
        </h2>
        <span>Discussion, not verified</span>
      </div>
      <p>
        {answer.questionKind === "unclear"
          ? "This question could not be settled by the available facts. These are places to explore."
          : "Headlines and conversations are starting points. Neither a popular theory nor a news link receives a verification seal."}
      </p>
      {fetched.length ? (
        <ol className="conversation-list">
          {fetched.map((l) => (
            <li key={l.url}>
              <a
                href={safe(l.url) ?? undefined}
                target="_blank"
                rel="noreferrer"
              >
                <div>
                  <span>{l.source}</span>
                  <span>
                    {l.kind === "news" ? "News link" : "Community thread"}
                  </span>
                </div>
                <h3>{l.title}</h3>
                <footer>
                  <time>
                    {l.publishedAt
                      ? new Date(l.publishedAt).toLocaleDateString("en", {
                          dateStyle: "medium",
                          timeZone: "UTC",
                        })
                      : "Date unlisted"}
                  </time>
                  <span>
                    {l.score !== null
                      ? l.score + " " + (l.scoreKind ?? "score")
                      : "Score unlisted"}
                  </span>
                  <Icon size={18} />
                </footer>
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="no-conversations">
          <Icon name="info" />
          No fetched headlines or threads in this response. The search links
          below are not invented posts.
        </p>
      )}
      <div className="conversation-searches">
        {searches.map((l) => (
          <a
            key={l.url}
            href={safe(l.url) ?? undefined}
            target="_blank"
            rel="noreferrer"
          >
            <span>
              {l.title}
              <small>
                {l.source} /{" "}
                {l.kind === "search" ? "search link" : "reference link"}
              </small>
            </span>
            <Icon size={16} />
          </a>
        ))}
      </div>
      <p className="conversation-footnote">
        Reddit is links-only here. No Reddit posts, scores or dates have been
        fetched.
      </p>
    </section>
  );
}
