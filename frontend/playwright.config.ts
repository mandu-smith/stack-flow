import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    headless: true,
  },
});
