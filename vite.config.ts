import vinext from "vinext";
import { defineConfig } from "vite";
import { existsSync, readFileSync } from "node:fs";

// Exported VS Code/Vercel projects have no Sites hosting metadata.
const hostingPath = new URL("./.openai/hosting.json", import.meta.url);
const hostingConfig: { d1?: string; r2?: string } = existsSync(hostingPath)
  ? JSON.parse(readFileSync(hostingPath, "utf8"))
  : {};
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const localBindingConfig = {
  main: "vinext/server/fetch-handler",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async ({ command }) => {
  // Use Miniflare's local Request.cf placeholder unless fetching is requested.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Cloudflare Vite 1.37.1 has a runner incompatibility with Vite 8 on Windows
  // during local development. This project currently has no D1/R2 bindings, so
  // Vinext can serve the local review directly while production builds keep the
  // Cloudflare integration enabled. The environment flag makes this path
  // testable on other operating systems without changing production behavior.
  const skipCloudflareDev =
    command === "serve" &&
    !d1 &&
    !r2 &&
    (process.platform === "win32" ||
      process.env.SITES_SKIP_CLOUDFLARE_DEV === "1");

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const cloudflarePlugin = skipCloudflareDev
    ? undefined
    : (await import("@cloudflare/vite-plugin")).cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      });

  return {
    server: {
      ...(managedLinux ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] } : {}),
      ...(isCodexSeatbeltSandbox ? { watch: { useFsEvents: false, usePolling: true } } : {}),
    },
    plugins: [
      vinext(),
      sites({ mockAuth: !managedLinux }),
      ...(cloudflarePlugin ? [cloudflarePlugin] : []),
    ],
  };
});
