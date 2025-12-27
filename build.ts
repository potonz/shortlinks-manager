#!/usr/bin/env bun

import fs, { rmSync } from "fs";
import path from "path";
import {
    type CompilationOptions,
    type EntryPointConfig,
    generateDtsBundle,
} from "dts-bundle-generator";
import type { BunPlugin } from "bun";

type Options = Omit<EntryPointConfig, "filePath"> & {
    compilationOptions?: CompilationOptions;
};

const dts = (options?: Options): BunPlugin => {
    return {
        name: "bun-plugin-dts",
        async setup(build) {
            const { compilationOptions, ...rest } = options || {};

            const entrypoints = [...build.config.entrypoints].sort();
            const entries = entrypoints.map((entry) => {
                return {
                    filePath: entry,
                    ...rest,
                };
            });

            const result = generateDtsBundle(entries, compilationOptions);

            const outDir = build.config.outdir || "./dist";
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }

            const commonPrefix = path.dirname(entrypoints[0]!);

            await Promise.all(
                entrypoints.map((entry, index) => {
                    const relativePath = path.relative(commonPrefix, entry);
                    const dtsFile = relativePath.replace(/\.[jt]s$/, ".d.ts");
                    const outFile = path.join(outDir, dtsFile);
                    const outFileDir = path.dirname(outFile);

                    if (!fs.existsSync(outFileDir)) {
                        fs.mkdirSync(outFileDir, { recursive: true });
                    }

                    return Bun.write(outFile, result[index]!);
                }),
            );
        },
    };
};

// Remove old files
rmSync("dist", { recursive: true, force: true });

// Bundle JS files
await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: "dist",
    format: "esm",
    target: "node",
    sourcemap: "linked",
    minify: true,
    external: ["node:*"],
    banner: `/* ${await Bun.file("LICENSE").text()} */`,
    plugins: [
        dts({
            compilationOptions: {
                preferredConfigPath: "tsconfig.bundle.json",
            },
        }),
    ],
});

// Remove dependencies from package.json
const packageJson = await Bun.file("package.json").json();
delete packageJson.devDependencies;
delete packageJson.peerDependencies;
delete packageJson.scripts;
// Write package.json
await Bun.write("dist/package.json", JSON.stringify(packageJson, null, 2));
