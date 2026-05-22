/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * combine-selected-modules.js
 *
 * Combines selected folders/files and outputs them into one file.
 * Modified to include inventory module, related imports, and UI folder.
 */

const fs = require("fs");
const path = require("path");

// Project root: tools/ → root
const ROOT_DIR = path.resolve(__dirname, "..");

// Allowed extensions
const INCLUDE_EXTENSIONS = [".tsx", ".ts"];

// ---------------------------
// Selected Modules for Inventory
// ---------------------------
const selectedModules = [
"src",
];

/**
 * Recursively fetch files from a directory
 */
function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (INCLUDE_EXTENSIONS.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Collect initial files from provided directories / files
 */
function collectInitialFiles(paths) {
  let files = [];

  for (const relPath of paths) {
    const fullPath = path.join(ROOT_DIR, relPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠ Path does not exist: ${relPath}`);
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath));
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      if (INCLUDE_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Find import paths from file content
 */
function findImports(content) {
  // Match imports like: from "@/path/to/module"
  const matches = content.matchAll(/from\s+["'](@\/[^"']+)["']/g);
  const imports = Array.from(matches, m => m[1]);

  // Also handle import ... from "@/..."
  const matches2 = content.matchAll(/import\s+.*?\s+from\s+["'](@\/[^"']+)["']/g);
  imports.push(...Array.from(matches2, m => m[1]));

  return new Set(imports);
}

/**
 * Resolve alias to full path
 */
function resolveImport(importPath) {
  if (importPath.startsWith('@/')) {
    return importPath.replace('@/', 'src/');
  }
  return importPath;
}

/**
 * Collect all related files by following imports
 */
function collectRelatedFiles(initialFiles) {
  const collected = new Set(initialFiles);
  let toProcess = [...initialFiles];

  while (toProcess.length > 0) {
    const current = toProcess.shift();
    const content = fs.readFileSync(current, 'utf-8');

    const imports = findImports(content);
    for (let imp of imports) {
      let resolved = resolveImport(imp);

      // If it's a directory, try index
      let fullPath = path.join(ROOT_DIR, resolved);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        resolved = path.join(resolved, 'index');
      }

      // Try .ts and .tsx extensions
      let found = false;
      for (const ext of INCLUDE_EXTENSIONS) {
        const candidate = path.join(ROOT_DIR, resolved + ext);
        if (fs.existsSync(candidate)) {
          fullPath = candidate;
          found = true;
          break;
        }
      }

      if (found && !collected.has(fullPath)) {
        collected.add(fullPath);
        toProcess.push(fullPath);
      }
    }
  }

  return Array.from(collected).sort();
}

/**
 * Combine
 */
function combineSelectedModules() {
  console.log("🔎 Combining inventory module and related files...");

  const initialFiles = collectInitialFiles(selectedModules);

  if (initialFiles.length === 0) {
    console.log("❌ No initial files found.");
    return;
  }

  const allFiles = collectRelatedFiles(initialFiles);

  if (allFiles.length === 0) {
    console.log("❌ No files to combine.");
    return;
  }

  let output = "";

  for (const file of allFiles) {
    const relative = path.relative(ROOT_DIR, file);
    console.log("→ " + relative);

    const content = fs.readFileSync(file, "utf-8");

    output += `\n\n/* ===== ${relative} ===== */\n\n`;
    output += content;
  }

  const outputFile = path.join(__dirname, `output-rainbow-bazaar-bd-backend-combine-${selectedModules[0].split('/')[selectedModules[0].split('/').length - 1]}-module.txt`);
  fs.writeFileSync(outputFile, output.trim(), "utf-8");

  console.log(`\n✅ Combined ${allFiles.length} files → ${outputFile}`);
}

combineSelectedModules();

// node tools/combine-selected-modules.js