import { build, BuildOptions } from "esbuild";

const files = ["function", "class"];
const mapBuild = (source: string, format: BuildOptions["format"]) => {
  const fileExt = format == "esm" ? "mjs" : "js";
  build({
    entryPoints: [`src/logger-${source}.ts`],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: `dist/${source}/logger.min.${fileExt}`,
    platform: "node",
    format,
    target: "node16",
  }).catch(() => process.exit(1));
};

files.map((v) => mapBuild(v, "cjs"));
files.map((v) => mapBuild(v, "esm"));
