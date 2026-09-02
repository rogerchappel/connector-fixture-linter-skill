import assert from "node:assert/strict";
import test from "node:test";

import { isReleaseVersion } from "../scripts/release-version.mjs";

test("release policy accepts the current and a representative next version", () => {
  assert.equal(isReleaseVersion("0.1.0"), true);
  assert.equal(isReleaseVersion("0.1.1"), true);
  assert.equal(isReleaseVersion("1.0.0"), true);
});

test("release policy rejects missing and malformed versions", () => {
  for (const version of [undefined, null, "", "0.1", "v0.1.1", "01.1.0", "1.0.0-"]) {
    assert.equal(isReleaseVersion(version), false, String(version));
  }
});
