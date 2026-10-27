import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, vi } from "vitest";

const scenarioState = vi.hoisted(() => ({
  actor: "admin" as "admin" | "coachA" | "coachB" | "anonymous",
  env: null as Record<string, unknown> | null,
  revalidations: [] as Array<{ kind: string; args: unknown[] }>,
}));

vi.mock("server-only", () => ({}));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => {
    if (!scenarioState.env) throw new Error("Scenario D1 proxy has not been initialized");
    return { env: scenarioState.env };
  },
}));
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => scenarioState.revalidations.push({ kind: "tag", args }),
  revalidatePath: (...args: unknown[]) => scenarioState.revalidations.push({ kind: "path", args }),
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
vi.mock("@/utils/auth", () => ({
  getSessionFromCookie: async () => scenarioSession(),
  requireAdmin: async () => {
    const session = scenarioSession();
    if (!session) throw new Error("Not authenticated");
    if (session.user.role !== "admin") throw new Error("Not authorized");
    return session;
  },
}));

function scenarioSession() {
  if (scenarioState.actor === "anonymous") return null;
  const userId = scenarioState.actor === "admin" ? "scenario-admin" : `scenario-${scenarioState.actor}`;
  return {
    userId,
    user: {
      id: userId,
      role: scenarioState.actor === "admin" ? "admin" : "user",
      email: `${scenarioState.actor}@scenario.test`,
      firstName: scenarioState.actor,
      lastName: "Scenario",
      emailVerified: true,
      currentCredits: 0,
      lastCreditRefreshAt: null,
    },
    teams: [],
  };
}

export function setScenarioActor(actor: typeof scenarioState.actor) {
  scenarioState.actor = actor;
}

export function scenarioRevalidations() {
  return scenarioState.revalidations;
}

export function clearScenarioRevalidations() {
  scenarioState.revalidations.length = 0;
}

let disposeProxy: (() => Promise<void>) | undefined;
let persistPath: string | undefined;

export async function initializeScenarioD1() {
  if (scenarioState.env) return scenarioState.env;
  const { getPlatformProxy } = await import("wrangler");
  persistPath = await mkdtemp(join(tmpdir(), "crossfit-open-scenarios-"));
  const proxy = await getPlatformProxy({
    configPath: resolve("wrangler.jsonc"),
    persist: { path: persistPath },
    envFiles: [],
  });
  const db = proxy.env.DB as D1Database;
  const migrationDir = resolve("src/db/migrations");
  const migrations = (await readdir(migrationDir)).filter((file) => /^\d+.*\.sql$/.test(file)).sort();
  for (const migration of migrations) {
    const source = await readFile(join(migrationDir, migration), "utf8");
    for (const statement of source.split(/--> statement-breakpoint\s*/).map((part) => part.trim()).filter(Boolean)) {
      await db.prepare(statement).run();
    }
  }
  scenarioState.env = proxy.env as Record<string, unknown>;
  disposeProxy = proxy.dispose;
  return scenarioState.env;
}

afterAll(async () => {
  scenarioState.env = null;
  await disposeProxy?.();
  if (persistPath) await rm(persistPath, { recursive: true, force: true });
});
