/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * combine-files.js (PRO VERSION)
 *
 * Full-code export with:
 *  - All essential code files
 *  - All important setup/config files
 *  - Clean directory tree structure
 *  - Binary-safe reads
 *  - LLM-optimized clean formatting
 *
 * Output: m1-clean.txt
 */

const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "../");
const outputFile = path.join(__dirname, "rainbow-bazaarbd-backend.txt");

// Include these file extensions
const allowedExtensions = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".css",
  ".scss"
];

// Excluded folders
const excludedFolders = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".turbo",
  ".git",
  "coverage",
  "test",
  "tests",
  "__tests__",
  "public", // images not needed for LLMs
  ".pnpm-store",
  "out"
];

const excludedFiles = [
  ".DS_Store",
  "thumbs.db",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production"
];

/**
 * Check if file is binary
 */
function isBinary(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.includes(0); // null byte → probably binary
  } catch {
    return true;
  }
}

/**
 * Recursively collect all allowed files
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const filename of files) {
    const fullPath = path.join(dir, filename);
    const relative = path.relative(projectRoot, fullPath);
    const stat = fs.statSync(fullPath);

    // Exclude excluded folders
    if (stat.isDirectory()) {
      if (excludedFolders.some(f => relative.startsWith(f))) continue;
      getAllFiles(fullPath, fileList);
      continue;
    }

    // Exclude specific files
    if (excludedFiles.includes(filename)) continue;

    const ext = path.extname(filename).toLowerCase();

    // Allow important config files even if extension not in list
    const alwaysIncludeFiles = [
      "next.config.js",
      "tsconfig.json",
      "package.json",
      ".eslintrc.js",
      "eslint.config.js",
      ".prettierrc",
      ".prettierrc.json",
      ".prettierrc.js",
      "docker-compose.yml",
      "Dockerfile",
      "README.md"
    ];

    const isAlwaysIncluded = alwaysIncludeFiles.includes(filename);

    if (allowedExtensions.includes(ext) || isAlwaysIncluded) {
      if (!isBinary(fullPath)) {
        fileList.push({
          path: fullPath,
          relative: relative
        });
      }
    }
  }

  return fileList;
}

/**
 * Generate a clean folder structure tree
 */
function generateTree(dir, prefix = "") {
  let tree = "";
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const fullPath = path.join(dir, file);
    const relative = path.relative(projectRoot, fullPath);

    if (excludedFolders.some(f => relative.startsWith(f))) return;

    const isLast = index === files.length - 1;
    const connector = isLast ? "└── " : "├── ";

    tree += `${prefix}${connector}${file}\n`;

    if (fs.statSync(fullPath).isDirectory()) {
      tree += generateTree(
        fullPath,
        prefix + (isLast ? "    " : "│   ")
      );
    }
  });

  return tree;
}

/**
 * Smart file type detection based on path
 */
function detectType(filepath) {
  const lower = filepath.toLowerCase();
  if (lower.includes("/app/")) return "Next.js Route";
  if (lower.includes("/api/")) return "API Layer";
  if (lower.includes("/components/")) return "UI Component";
  if (lower.includes("/hooks/")) return "React Hook";
  if (lower.includes("/features/")) return "Feature Module";
  if (lower.includes("config")) return "Config File";
  if (lower.endsWith(".md")) return "Documentation";
  return "Source File";
}

/**
 * MAIN FUNCTION
 */
function run() {
  console.log("📦 Generating full code export...");

  let content = `# 📁 Combined Project Source (For LLM Use)
Generated: ${new Date().toISOString()}

=========================================
📂 PROJECT FOLDER STRUCTURE
=========================================

${generateTree(projectRoot)}

=========================================
📦 SOURCE FILES
=========================================

`;

  // Collect files
  const files = getAllFiles(projectRoot);
  files.sort((a, b) => a.relative.localeCompare(b.relative));

  // Write each file
  for (const file of files) {
    const fileContent = fs.readFileSync(file.path, "utf-8");
    const sizeKB = (Buffer.byteLength(fileContent) / 1024).toFixed(2);
    const type = detectType(file.relative);

    content += `
============================================================
===== FILE START: ${file.relative}
Type: ${type}
Size: ${sizeKB} KB
============================================================

${fileContent}

===== END FILE =====


`;
  }

  fs.writeFileSync(outputFile, content);
  console.log(`✨ Done! File generated: ${outputFile}`);
}

run();

// node tools/combine-files.js
