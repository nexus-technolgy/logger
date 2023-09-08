"use strict";

import esbuild from "esbuild";

class ESBuild {
  constructor() {
    this.config = {
      sourcemap: true,
      platform: "node",
      target: ["node18"],
      legalComments: "inline",
      treeShaking: true,
      tsconfig: "tsconfig.json",
    };

    this.esbuild = esbuild;
  }

  build() {
    // Build for ESM
    this.esbuild.build({
      ...this.config,
      minify: true,
      bundle: true,
      external: ["browser-util-inspect"],
      entryPoints: ["./src/logger-class.ts", "./src/logger-function.ts"],
      format: "esm",
      outdir: "dist/esm",
    });
    this.esbuild
      .build({
        ...this.config,
        bundle: false,
        entryPoints: ["./src/index.ts"],
        format: "esm",
        outdir: "dist/esm",
      })
      .then(() => {
        console.log("ESM Bundling complete");
      });

    // Build for CJS
    this.esbuild.build({
      ...this.config,
      minify: true,
      bundle: true,
      external: ["browser-util-inspect"],
      entryPoints: ["./src/logger-class.ts", "./src/logger-function.ts"],
      format: "cjs",
      outdir: "dist/cjs",
    });
    this.esbuild
      .build({
        ...this.config,
        bundle: false,
        entryPoints: ["./src/index.ts"],
        format: "cjs",
        outdir: "dist/cjs",
      })
      .then(() => {
        console.log("CommonJS Bundling complete");
      });
  }
}

const bundler = new ESBuild();
bundler.build();
