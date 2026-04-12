import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";

/**
 * Vite plugin: AppVersionPlugin
 *
 * What it does:
 *   1. Gets the current git commit hash (short SHA) at build time.
 *      Falls back to a timestamp if git is unavailable (e.g. CI without git history).
 *   2. Injects the version string as VITE_APP_VERSION into import.meta.env
 *      so the running bundle knows what version it is.
 *   3. Writes /public/version.json with { "version": "<hash>" } so the
 *      useAppVersion hook can fetch it at runtime to detect new deploys.
 *
 * Usage — add to vite.config.ts:
 *
 *   import { appVersionPlugin } from "./src/plugins/appVersionPlugin";
 *
 *   export default defineConfig({
 *     plugins: [react(), appVersionPlugin()],
 *   });
 */
export function appVersionPlugin(): Plugin {
  let version: string;

  return {
    name: "app-version",

    // Runs before Vite starts bundling
    buildStart() {
      version = getVersion();
      console.log(`[AppVersionPlugin] Build version: ${version}`);
    },

    // Inject VITE_APP_VERSION so the bundle can read it via import.meta.env
    config() {
      return {
        define: {
          "import.meta.env.VITE_APP_VERSION": JSON.stringify(version ?? getVersion()),
        },
      };
    },

    // Write version.json into the output directory after the build finishes
    closeBundle() {
      const outDir = resolve(process.cwd(), "dist");
      const filePath = resolve(outDir, "version.json");
      writeFileSync(filePath, JSON.stringify({ version }, null, 2), "utf-8");
      console.log(`[AppVersionPlugin] Written: dist/version.json (version=${version})`);
    },
  };
}

function getVersion(): string {
  try {
    // Short git commit SHA — stable, unique, maps directly to a GitHub commit
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    // Fallback for environments without git (rare on Cloudflare Pages)
    return Date.now().toString(36);
  }
}