import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

test("labels the work and its truth boundary", () => {
  assert.match(page, /Interactive reference build/);
  assert.match(page, /What this proves/);
  assert.match(readme, /not connected to a language model/i);
});

test("demonstrates citations, abstention, review and evaluation", () => {
  assert.match(page, /Citation anchor/);
  assert.match(page, /SAFE ABSTENTION/);
  assert.match(page, /HUMAN REVIEW/);
  assert.match(page, /Golden-set result/);
});

test("has conversion analytics hooks", () => {
  for (const event of ["demo_start", "demo_complete", "cta_click"]) assert.match(page, new RegExp(event));
});
