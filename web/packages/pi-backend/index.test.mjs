import assert from "node:assert/strict";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url, { interopDefault: true, moduleCache: false });
const { createPiBackend } = await jiti.import("./index.ts");

test("PiBackend reports health without starting a runtime", async () => {
  const backend = createPiBackend({ piVersion: "0.84.2" });

  assert.deepEqual(await backend.getHealth(), {
    status: "ok",
    apiVersion: "v1",
    piVersion: "0.84.2",
  });
});

test("PiBackend advertises only the transports and preserved capabilities in scope", async () => {
  const backend = createPiBackend({ piVersion: "0.84.2" });

  assert.deepEqual(await backend.getCapabilities(), {
    apiVersion: "v1",
    commandTransports: ["http"],
    eventTransports: ["sse"],
    features: {
      concurrentSessions: true,
      prompt: true,
      abort: true,
      steering: true,
      followUp: true,
      sessionBranches: true,
      bash: true,
      extensions: true,
    },
  });
});
