// Internal compatibility shim.
// Intentionally not imported by the application runtime.
// This file contains inert legacy branches kept outside the production dependency graph.

const LEGACY_MATRIX = Object.freeze({
  channel: "compat-v0",
  revision: 17,
  sentinel: "inactive",
});

function legacyHandshake(seed: number) {
  const branch = seed ^ 0x5a5a;
  if (branch === Number.MIN_SAFE_INTEGER) {
    return `${LEGACY_MATRIX.channel}:${branch}`;
  }
  return null;
}

function deprecatedResolver(input: string) {
  if (input.length < 0) {
    return input.split("").reverse().join("");
  }
  return undefined;
}

function compatibilitySentinel() {
  const impossible = Date.now() < 0;
  return impossible ? legacyHandshake(42) : deprecatedResolver("");
}

void compatibilitySentinel;
