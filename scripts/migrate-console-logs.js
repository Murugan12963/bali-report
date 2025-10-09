#!/usr/bin/env node
/**
 * Console.log Migration Script
 * Automatically replaces console.log/warn/error calls with the new logger service
 *
 * Usage: node scripts/migrate-console-logs.js [--dry-run] [--file path/to/file.ts]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const targetFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Skip these files/directories
const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '__tests__',
  '.test.',
  '.spec.',
  'logger-service.ts', // Don't modify the logger itself
  'logger.ts',
];

// Mapping of console methods to logger methods
const CONSOLE_TO_LOGGER = {
  'console.log': 'logger.info',
  'console.info': 'logger.info',
  'console.warn': 'logger.warn',
  'console.error': 'logger.error',
  'console.debug': 'logger.debug',
};

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
  errors: [],
};

/**
 * Check if file should be skipped
 */
function shouldSkipFile(filePath) {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Get all TypeScript/JavaScript files
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldSkipFile(filePath)) {
        getAllFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.some(ext => file.endsWith(ext))) {
      if (!shouldSkipFile(filePath)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Check if file already imports logger
 */
function hasLoggerImport(content) {
  return /import\s+.*\s+from\s+['"]@\/lib\/logger-service['"]/.test(content) ||
         /import\s+.*\s+from\s+['"].*logger.*['"]/.test(content);
}

/**
 * Add logger import to file
 */
function addLoggerImport(content) {
  // Find the last import statement
  const importRegex = /import\s+.*\s+from\s+['"].*['"]/g;
  const imports = content.match(importRegex);

  if (!imports || imports.length === 0) {
    // No imports found, add at the beginning
    return `import { logger } from '@/lib/logger-service';\n\n${content}`;
  }

  // Find the position after the last import
  const lastImport = imports[imports.length - 1];
  const lastImportIndex = content.lastIndexOf(lastImport);
  const insertPosition = lastImportIndex + lastImport.length;

  return content.slice(0, insertPosition) +
         `\nimport { logger } from '@/lib/logger-service';` +
         content.slice(insertPosition);
}

/**
 * Replace console calls with logger calls
 */
function replaceConsoleCalls(content) {
  let modified = content;
  let replacementCount = 0;

  Object.entries(CONSOLE_TO_LOGGER).forEach(([consoleMethod, loggerMethod]) => {
    // Match console.method(...) calls
    const regex = new RegExp(`\\b${consoleMethod.replace('.', '\\.')}\\s*\\(`, 'g');
    const matches = modified.match(regex);

    if (matches) {
      replacementCount += matches.length;
      modified = modified.replace(regex, `${loggerMethod}(`);
    }
  });

  return { content: modified, count: replacementCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;

    const relativePath = path.relative(process.cwd(), filePath);
    const originalContent = fs.readFileSync(filePath, 'utf8');

    // Check if file has console calls
    const hasConsoleCalls = Object.keys(CONSOLE_TO_LOGGER).some(method =>
      originalContent.includes(method)
    );

    if (!hasConsoleCalls) {
      return; // Nothing to do
    }

    let content = originalContent;

    // Add logger import if needed
    if (!hasLoggerImport(content)) {
      content = addLoggerImport(content);
    }

    // Replace console calls
    const { content: modifiedContent, count } = replaceConsoleCalls(content);

    if (count > 0) {
      stats.filesModified++;
      stats.replacements += count;

      console.log(`✓ ${relativePath}: ${count} replacements`);

      if (!isDryRun) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
      }
    }
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`✗ ${filePath}: ${error.message}`);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Console.log Migration Script\n');

  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }

  let files;

  if (targetFile) {
    // Process single file
    const fullPath = path.resolve(targetFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found: ${targetFile}`);
      process.exit(1);
    }
    files = [fullPath];
    console.log(`Processing single file: ${targetFile}\n`);
  } else {
    // Process all files
    console.log(`Scanning directory: ${SRC_DIR}\n`);
    files = getAllFiles(SRC_DIR);
    console.log(`Found ${files.length} files to process\n`);
  }

  // Process each file
  files.forEach(processFile);

  // Print summary
  console.log('\n📊 Migration Summary:');
  console.log('='.repeat(50));
  console.log(`Files processed:  ${stats.filesProcessed}`);
  console.log(`Files modified:   ${stats.filesModified}`);
  console.log(`Total replacements: ${stats.replacements}`);
  console.log(`Errors:           ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${path.relative(process.cwd(), file)}: ${error}`);
    });
  }

  if (isDryRun) {
    console.log('\n⚠️  This was a dry run. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run type-check');
    console.log('  2. Run: npm run lint');
    console.log('  3. Test your application');
    console.log('  4. Commit the changes');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, replaceConsoleCalls };
