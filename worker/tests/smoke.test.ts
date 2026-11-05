import { expect, it, vi } from "vitest";
import { smoke } from "../scripts/smoke";
import { environment, provider, draft } from "./fixtures";
import type { Fetcher } from "../src/types";
it("makes one call per configured provider and prints only safe status lines", async () => {
  const env = environment({} as D1Database, {
    PROVIDERS_JSON: JSON.stringify([
      provider("one"),
      provider("two"),
      { ...provider("absent"), keyEnv: "MISSING" },
    ]),
  });
  let calls = 0;
  const net = vi.fn(async () => {
    calls++;
    return calls === 1
      ? new Response(
          JSON.stringify({
            choices: [{ message: { content: JSON.stringify(draft) } }],
          }),
        )
      : new Response("private account data", { status: 429 });
  }) as unknown as Fetcher;
  const lines: string[] = [];
  await smoke(env, net, (line) => lines.push(line));
  expect(net).toHaveBeenCalledTimes(2);
  expect(lines).toEqual([
    "one: http_200_valid_json",
    "two: http_429",
    "absent: unconfigured",
  ]);
  expect(lines.join("")).not.toContain(env.ZAI_API_KEY);
});
