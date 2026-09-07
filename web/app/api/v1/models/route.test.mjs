import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createV1Jiti } from "../test-helper.mjs";

const jiti = createV1Jiti();
const { GET } = await jiti.import(new URL("./route.ts", import.meta.url).href);

test("GET /api/v1/models returns the model catalog under { data }", async () => {
  const dir = mkdtempSync(join(tmpdir(), "api-v1-models-"));
  try {
    const res = await GET(new Request(`http://localhost/api/v1/models?cwd=${encodeURIComponent(dir)}`));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data.modelList));
    assert.equal(typeof body.data.models, "object");
    assert.equal(typeof body.data.thinkingLevels, "object");
    assert.equal(body.error, undefined);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("GET /api/v1/models rejects a missing cwd with invalid_request 400", async () => {
  const missing = join(tmpdir(), "definitely-not-a-dir-xyz");
  const res = await GET(new Request(`http://localhost/api/v1/models?cwd=${encodeURIComponent(missing)}`));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, "invalid_request");
  assert.match(body.error.message, /^Directory does not exist:/);
});

test("GET /api/v1/models rejects a non-directory cwd with invalid_request 400", async () => {
  const dir = mkdtempSync(join(tmpdir(), "api-v1-models-file-"));
  const filePath = join(dir, "file.txt");
  writeFileSync(filePath, "x");
  try {
    const res = await GET(new Request(`http://localhost/api/v1/models?cwd=${encodeURIComponent(filePath)}`));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, "invalid_request");
    assert.match(body.error.message, /^Not a directory:/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
