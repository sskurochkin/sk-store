import * as path from "node:path";
import fsExtra from "fs-extra";
import { glob } from "glob";
import { parse } from "node-html-parser";
import { optimize } from "svgo";

const cwd = process.cwd();
const inputDir = path.join(cwd, "./src/", "assets", "icons");
const inputDirRelative = path.relative(cwd, inputDir);
const typeDir = path.join(cwd, "types");
const outputDir = path.join(cwd, "public", "icons");
await fsExtra.ensureDir(outputDir);
await fsExtra.ensureDir(typeDir);

const files = glob
  .sync("**/*.svg", {
    cwd: inputDir,
  })
  .sort((a, b) => a.localeCompare(b));

const shouldVerboseLog = process.argv.includes("--log=verbose");
const logVerbose = shouldVerboseLog ? console.log : () => {};

if (files.length === 0) {
  console.log(`No SVG files found in ${inputDirRelative}`);
} else {
  await generateIconFiles();
}

async function generateIconFiles() {
  const spriteFilepath = path.join(outputDir, "sprite.svg");
  const currentSprite = await fsExtra
    .readFile(spriteFilepath, "utf8")
    .catch(() => "");

  const iconNames = files.map((file) => iconName(file));

  const spriteUpToDate = iconNames.every((name) =>
    currentSprite.includes(`id=${name}`)
  );

  if (spriteUpToDate) {
    logVerbose(`Icons are up to date`);
    return;
  }

  logVerbose(`Generating sprite for ${inputDirRelative}`);

  const spriteChanged = await generateSvgSprite({
    files,
    inputDir,
    outputPath: spriteFilepath,
  });

  for (const file of files) {
    logVerbose("✅", file);
  }
  logVerbose(`Saved to ${path.relative(cwd, spriteFilepath)}`);

  const readmeChanged = await writeIfChanged(
    path.join(inputDir, "README.md"),
    `# Icons
 
This directory contains SVG icons that are used by the app.
 
Everything in this directory is made into a sprite using \`npm run build:icons\`. This file will show in /public/icons/sprite.svg
`
  );

  if (spriteChanged || readmeChanged) {
    console.log(`Generated ${files.length} icons`);
  }
}

function iconName(file) {
  return file.replace(/\.svg$/, "").replace(/\\/g, "/");
}

/**
 * Creates a single SVG file that contains all the icons
 */
async function generateSvgSprite({ files, inputDir, outputPath }) {
  // Each SVG becomes a symbol and we wrap them all in a single SVG
  const symbols = await Promise.all(
    files.map(async (file) => {
      const input = await fsExtra.readFile(path.join(inputDir, file), "utf8");

      const { data } = optimize(input, {
        // path: 'input.svg', // optional but recommended
        multipass: true, // enables multiple optimization passes
        plugins: [
			'removeDoctype',
			'removeXMLProcInst',
			'removeComments',
			'removeMetadata',
			'removeEditorsNSData',
			'cleanupAttrs',
			'mergeStyles',
			'inlineStyles',
			'minifyStyles',
			// 'cleanupIds',
			'removeUselessDefs',
			'cleanupNumericValues',
			'convertColors',
			'removeUnknownsAndDefaults',
			'removeNonInheritableGroupAttrs',
			'removeUselessStrokeAndFill',
			// 'removeViewBox',
			'cleanupEnableBackground',
			'removeHiddenElems',
			'removeEmptyText',
			'convertShapeToPath',
			'convertEllipseToCircle',
			'moveElemsAttrsToGroup',
			'moveGroupAttrsToElems',
			'collapseGroups',
			'convertPathData',
			'convertTransform',
			'removeEmptyAttrs',
			'removeEmptyContainers',
			'removeUnusedNS',
			'mergePaths',
			'sortAttrs',
			'sortDefsChildren',
			'removeTitle',
			'removeDesc',
          {
            name: "removeAttrs",
            params: {
              attrs: "(fill|stroke|width|height|xmlns|clip-path)",
            },
          },
        ],
      });

      const root = parse(data);
      const svg = root.querySelector("svg");
      if (!svg) throw new Error("No SVG element found");
      svg.tagName = "symbol";
      svg.setAttribute("id", `${iconName(file)}`);
      return svg.toString().trim();
    })
  );

  const output = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0">`,
    `<defs>`, // for semantics: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
    ...symbols,
    `</defs>`,
    `</svg>`,
  ].join("\n");

  return writeIfChanged(outputPath, output);
}

async function writeIfChanged(filepath, newContent) {
  const currentContent = await fsExtra
    .readFile(filepath, "utf8")
    .catch(() => "");
  if (currentContent === newContent) return false;
  await fsExtra.writeFile(filepath, newContent, "utf8");
  return true;
}
