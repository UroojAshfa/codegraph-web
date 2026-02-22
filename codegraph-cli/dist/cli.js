"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const analyzer_1 = require("./analyzer");
const ai_1 = require("./ai");
const batch_analyzer_1 = require("./batch-analyzer");
const report_generator_1 = require("./report-generator");
// Load dotenv at the very top, silently
try {
    const dotenv = require('dotenv');
    const originalWarn = console.warn;
    const originalLog = console.log;
    console.warn = () => { }; // Suppress warnings
    console.log = () => { }; // Suppress logs
    dotenv.config();
    console.warn = originalWarn; // Restore
    console.log = originalLog;
}
catch {
    // Ignore if dotenv not available
}
const program = new commander_1.Command();
program
    .name('codegraph')
    .description('AI-powered codebase intelligence tool')
    .version('0.1.0');
// HELPER FUNCTIONS
// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j] + 1 // deletion
                );
            }
        }
    }
    return matrix[str2.length][str1.length];
}
// Find closest match to a function name
function findClosestMatch(target, options) {
    if (options.length === 0)
        return null;
    let closest = options[0];
    let minDistance = levenshteinDistance(target.toLowerCase(), closest.toLowerCase());
    for (const option of options) {
        const distance = levenshteinDistance(target.toLowerCase(), option.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            closest = option;
        }
    }
    // Only suggest if it's reasonably close (within 3 edits)
    if (minDistance <= 3 && minDistance < target.length) {
        return closest;
    }
    return null;
}
function getApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error(chalk_1.default.red('\n✗ GEMINI_API_KEY not found\n'));
        console.log(chalk_1.default.yellow('To use AI features, set your API key:\n'));
        console.log(chalk_1.default.gray('  Option 1: Create a .env file:'));
        console.log(chalk_1.default.cyan('    GEMINI_API_KEY=your_key_here\n'));
        console.log(chalk_1.default.gray('  Option 2: Export as environment variable:'));
        console.log(chalk_1.default.cyan('    export GEMINI_API_KEY=your_key_here\n'));
        console.log(chalk_1.default.gray('  Get your free API key at:'));
        console.log(chalk_1.default.cyan('    https://makersuite.google.com/app/apikey\n'));
        process.exit(1);
    }
    return apiKey;
}
function validateDirectory(directory) {
    if (!fs.existsSync(directory)) {
        console.error(chalk_1.default.red(`\n✗ Directory not found: ${directory}\n`));
        console.log(chalk_1.default.yellow('Make sure the path is correct and try again.\n'));
        process.exit(1);
    }
    const stat = fs.statSync(directory);
    if (!stat.isDirectory()) {
        console.error(chalk_1.default.red(`\n✗ Path is not a directory: ${directory}\n`));
        process.exit(1);
    }
}
function validateFile(file) {
    if (!fs.existsSync(file)) {
        console.error(chalk_1.default.red(`\n✗ File not found: ${file}\n`));
        console.log(chalk_1.default.yellow('Make sure the path is correct and try again.\n'));
        process.exit(1);
    }
    const stat = fs.statSync(file);
    if (!stat.isFile()) {
        console.error(chalk_1.default.red(`\n✗ Path is not a file: ${file}\n`));
        process.exit(1);
    }
    const ext = path.extname(file);
    if (!['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
        console.error(chalk_1.default.red(`\n✗ Unsupported file type: ${ext}\n`));
        console.log(chalk_1.default.yellow('Supported types: .js, .ts, .jsx, .tsx\n'));
        process.exit(1);
    }
}
function handleError(error, context) {
    console.error(chalk_1.default.red(`\n✗ ${context} failed\n`));
    if (error instanceof Error) {
        console.error(chalk_1.default.gray(`Error: ${error.message}\n`));
        // Provide helpful suggestions based on error type
        if (error.message.includes('ENOENT')) {
            console.log(chalk_1.default.yellow('Tip: Check that the file or directory exists\n'));
        }
        else if (error.message.includes('EACCES')) {
            console.log(chalk_1.default.yellow('Tip: Check file permissions\n'));
        }
        else if (error.message.includes('AI analysis failed')) {
            console.log(chalk_1.default.yellow('Tip: Check your GEMINI_API_KEY or internet connection\n'));
        }
    }
    else {
        console.error(chalk_1.default.gray(`Unknown error occurred\n`));
    }
    process.exit(1);
}
// ANALYZE COMMAND (No AI needed)
program
    .command('analyze <directory>')
    .description('Analyze a codebase and generate call graph')
    .option('-o, --output <file>', 'Output file path', 'output')
    .option('-f, --format <type>', 'Output format (json|mermaid|both)', 'both')
    .option('--no-stats', 'Skip statistics display')
    .action((directory, options) => {
    console.log(chalk_1.default.bold.cyan('\n🚀 CodeGraph - Codebase Analysis\n'));
    // Validate input
    validateDirectory(directory);
    const spinner = (0, ora_1.default)('Scanning directory structure...').start();
    try {
        const analyzer = new analyzer_1.CodeAnalyzer();
        spinner.text = 'Parsing source files...';
        const graph = analyzer.analyzeDirectory(directory);
        const fileCount = analyzer.getFileCount();
        const nodeCount = graph.getAllNodes().length;
        const edgeCount = graph.getAllEdges().length;
        spinner.succeed(chalk_1.default.green(`Analyzed ${fileCount} files, found ${nodeCount} functions, ${edgeCount} calls`));
        // Show statistics
        if (options.stats) {
            console.log('\n' + chalk_1.default.bold('📊 STATISTICS\n'));
            graph.printStats();
        }
        // Save outputs
        const outputBase = path.resolve(options.output);
        if (options.format === 'json' || options.format === 'both') {
            const jsonOutput = graph.toJSON();
            const jsonFile = outputBase + '.json';
            fs.writeFileSync(jsonFile, JSON.stringify(jsonOutput, null, 2));
            console.log(chalk_1.default.green(`\n💾 JSON saved to: ${jsonFile}`));
        }
        if (options.format === 'mermaid' || options.format === 'both') {
            const mermaidDiagram = graph.toMermaid();
            const mermaidFile = outputBase + '.md';
            const content = `# Call Graph Visualization

\`\`\`mermaid
${mermaidDiagram}
\`\`\`

View this diagram at: https://mermaid.live
`;
            fs.writeFileSync(mermaidFile, content);
            console.log(chalk_1.default.green(`📊 Mermaid diagram saved to: ${mermaidFile}`));
        }
        console.log(chalk_1.default.bold.green('\n✨ Analysis complete!\n'));
    }
    catch (error) {
        spinner.fail();
        handleError(error, 'Analysis');
    }
});
// EXPLAIN COMMAND (AI required)
program
    .command('explain <file> <functionName>')
    .description('Get AI explanation of a specific function')
    .action(async (file, functionName) => {
    console.log(chalk_1.default.bold.cyan('\n🤖 AI Function Analysis\n'));
    // Validate inputs
    validateFile(file);
    const apiKey = getApiKey();
    const spinner = (0, ora_1.default)('Analyzing codebase...').start();
    try {
        const analyzer = new analyzer_1.CodeAnalyzer();
        const directory = path.dirname(file);
        spinner.text = 'Building call graph...';
        const graph = analyzer.analyzeDirectory(directory);
        spinner.text = 'Finding function...';
        const complexity = analyzer.getComplexity().find(c => c.name === functionName);
        if (!complexity) {
            spinner.fail(chalk_1.default.red(`Function "${functionName}" not found`));
            // Show available functions from the specific file
            const normalizedFile = path.resolve(file);
            const allFunctions = analyzer.getComplexity()
                .filter(c => path.resolve(c.file) === normalizedFile)
                .map(c => ({
                name: c.name,
                complexity: c.complexity,
                params: c.paramCount,
                lines: c.lineCount
            }));
            if (allFunctions.length > 0) {
                const functionNames = allFunctions.map(f => f.name);
                const closestMatch = findClosestMatch(functionName, functionNames);
                if (closestMatch) {
                    console.log(chalk_1.default.yellow(`\n💡 Did you mean: ${chalk_1.default.cyan(closestMatch)}?\n`));
                }
                console.log(chalk_1.default.yellow(`Available functions in ${chalk_1.default.cyan(path.basename(file))}:\n`));
                allFunctions.forEach(fn => {
                    const complexityWarning = fn.complexity > 10 ? chalk_1.default.red(' ⚠️') : chalk_1.default.green(' ✓');
                    const highlight = fn.name === closestMatch ? chalk_1.default.cyan('→ ') : '  ';
                    console.log(`${highlight}${chalk_1.default.cyan(fn.name)} ` +
                        chalk_1.default.gray(`(${fn.params} params, ${fn.lines} lines, complexity: ${fn.complexity})`) +
                        complexityWarning);
                });
                console.log(chalk_1.default.gray('\nTip: Function names are case-sensitive'));
            }
            else {
                console.log(chalk_1.default.yellow('\nNo functions found in this file.'));
            }
            console.log();
            process.exit(1);
        }
        const callers = graph.getCallers(functionName);
        const callees = graph.getCallees(functionName);
        // Extract function code
        const fileContent = fs.readFileSync(file, 'utf-8');
        const lines = fileContent.split('\n');
        const startLine = complexity.line - 1;
        const endLine = startLine + complexity.lineCount;
        const functionCode = lines.slice(startLine, endLine).join('\n');
        spinner.text = 'Asking AI for analysis...';
        const ai = new ai_1.AIService(apiKey);
        const explanation = await ai.explainFunction(functionName, functionCode, complexity.complexity, callers, callees);
        spinner.succeed(chalk_1.default.green('Analysis complete!'));
        // Display results
        console.log(chalk_1.default.bold(`\n📍 Function: ${chalk_1.default.cyan(functionName)}`));
        console.log(chalk_1.default.gray(`   Location: ${file}:${complexity.line}`));
        console.log(chalk_1.default.gray(`   Complexity: ${complexity.complexity} ${complexity.complexity > 10 ? '⚠️' : '✅'}`));
        console.log(chalk_1.default.gray(`   Lines: ${complexity.lineCount}`));
        console.log(chalk_1.default.gray(`   Parameters: ${complexity.paramCount}`));
        console.log(chalk_1.default.bold('\n🔍 Context:'));
        console.log(chalk_1.default.gray(`   Called by: ${callers.length > 0 ? callers.join(', ') : 'none (entry point)'}`));
        console.log(chalk_1.default.gray(`   Calls: ${callees.length > 0 ? callees.join(', ') : 'none (leaf function)'}`));
        console.log(chalk_1.default.bold('\n🤖 AI Analysis:\n'));
        console.log(explanation);
        // Code smell detection
        spinner.start('Detecting code smells...');
        const smells = await ai.detectCodeSmells(functionCode, complexity.complexity, complexity.lineCount, complexity.paramCount);
        spinner.stop();
        if (smells.length > 0 && smells[0] !== 'No obvious code smells detected ') {
            console.log(chalk_1.default.bold('\n  Code Smells:\n'));
            smells.forEach(smell => {
                if (smell.startsWith('💡')) {
                    console.log(chalk_1.default.yellow(smell));
                }
                else {
                    console.log(chalk_1.default.red(`   • ${smell}`));
                }
            });
        }
        else {
            console.log(chalk_1.default.bold.green('\n No code smells detected'));
        }
        console.log();
    }
    catch (error) {
        spinner.fail();
        handleError(error, 'Function analysis');
    }
});
// ANALYZE-COMPLEX COMMAND (AI required)
program
    .command('analyze-complex <directory>')
    .description('Find and analyze complex functions using AI')
    .option('-t, --threshold <number>', 'Complexity threshold', '10')
    .option('-l, --limit <number>', 'Max functions to analyze', '10')
    .action(async (directory, options) => {
    console.log(chalk_1.default.bold.cyan('\n AI Complexity Analysis\n'));
    // Validate inputs
    validateDirectory(directory);
    const apiKey = getApiKey();
    const threshold = parseInt(options.threshold);
    const limit = parseInt(options.limit);
    if (isNaN(threshold) || threshold < 1) {
        console.error(chalk_1.default.red('✗ Threshold must be a positive number\n'));
        process.exit(1);
    }
    const spinner = (0, ora_1.default)('Analyzing codebase...').start();
    try {
        const analyzer = new analyzer_1.CodeAnalyzer();
        spinner.text = 'Scanning for complex functions...';
        analyzer.analyzeDirectory(directory);
        const complexity = analyzer.getComplexity();
        const complex = complexity
            .filter(c => c.complexity > threshold)
            .sort((a, b) => b.complexity - a.complexity)
            .slice(0, limit);
        if (complex.length === 0) {
            spinner.succeed(chalk_1.default.green(`No functions with complexity >${threshold} found!`));
            console.log(chalk_1.default.green(`\n✅ All ${complexity.length} functions have acceptable complexity\n`));
            return;
        }
        const totalComplex = complexity.filter(c => c.complexity > threshold).length;
        spinner.succeed(chalk_1.default.green(`Found ${totalComplex} complex functions (showing top ${complex.length})`));
        const ai = new ai_1.AIService(apiKey);
        console.log(chalk_1.default.bold('\n📊 Complex Functions:\n'));
        for (let i = 0; i < complex.length; i++) {
            const fn = complex[i];
            console.log(chalk_1.default.bold(`${i + 1}. ${chalk_1.default.red(fn.name)}`));
            console.log(chalk_1.default.gray(`   Complexity: ${fn.complexity} | Lines: ${fn.lineCount} | Params: ${fn.paramCount}`));
            console.log(chalk_1.default.gray(`   Location: ${fn.file}:${fn.line}\n`));
            const aiSpinner = (0, ora_1.default)('Asking AI...').start();
            try {
                const analysis = await ai.analyzeComplexity(fn.name, fn.complexity, fn.lineCount);
                aiSpinner.succeed();
                console.log(chalk_1.default.yellow(`    ${analysis}\n`));
            }
            catch (error) {
                aiSpinner.fail(chalk_1.default.red('AI request failed'));
                console.log(chalk_1.default.gray(`   (Skipping AI analysis for this function)\n`));
            }
        }
        console.log(chalk_1.default.bold.green(`✨ Analyzed ${complex.length} of ${totalComplex} complex functions\n`));
        if (totalComplex > limit) {
            console.log(chalk_1.default.yellow(` Tip: Use --limit ${totalComplex} to analyze all complex functions\n`));
        }
    }
    catch (error) {
        spinner.fail();
        handleError(error, 'Complexity analysis');
    }
});
program
    .command('batch-explain <directory>')
    .description('Automatically analyze all complex functions with AI')
    .option('-t, --threshold <number>', 'Complexity threshold', '10')
    .option('-l, --limit <number>', 'Max functions to analyze', '20')
    .option('-o, --output <file>', 'Output file base name', 'batch-analysis')
    .action(async (directory, options) => {
    console.log(chalk_1.default.bold.cyan('\n🔍 CodeGraph - Batch Analysis\n'));
    // Validate inputs
    validateDirectory(directory);
    const apiKey = getApiKey();
    const threshold = parseInt(options.threshold);
    const limit = parseInt(options.limit);
    if (isNaN(threshold) || threshold < 1) {
        console.error(chalk_1.default.red('✗ Threshold must be a positive number\n'));
        process.exit(1);
    }
    if (isNaN(limit) || limit < 1) {
        console.error(chalk_1.default.red('✗ Limit must be a positive number\n'));
        process.exit(1);
    }
    const spinner = (0, ora_1.default)('Analyzing codebase...').start();
    try {
        // Step 1: Analyze the codebase
        const analyzer = new analyzer_1.CodeAnalyzer();
        spinner.text = 'Scanning directory structure...';
        const graph = analyzer.analyzeDirectory(directory);
        const fileCount = analyzer.getFileCount();
        const complexity = analyzer.getComplexity();
        const totalFunctions = complexity.length;
        spinner.succeed(chalk_1.default.green(`Analyzed ${fileCount} files, found ${totalFunctions} functions`));
        // Check if there are complex functions
        const complexFunctions = complexity.filter(c => c.complexity > threshold);
        if (complexFunctions.length === 0) {
            console.log(chalk_1.default.green(`\n✅ No functions with complexity >${threshold} found!`));
            console.log(chalk_1.default.green(`All ${totalFunctions} functions have acceptable complexity\n`));
            return;
        }
        // Step 2: Batch analyze with AI
        const batchAnalyzer = new batch_analyzer_1.BatchAnalyzer(apiKey);
        const projectName = path.basename(directory);
        const result = await batchAnalyzer.analyzeBatch(complexity, threshold, limit, projectName, fileCount, totalFunctions);
        // Step 3: Save results
        const outputBase = path.resolve(options.output);
        await batchAnalyzer.saveResults(result, outputBase);
        console.log(chalk_1.default.bold.green('\n✨ Batch analysis complete!\n'));
        // Show next steps
        if (result.summary.criticalIssues > 0) {
            console.log(chalk_1.default.yellow('💡 Next steps:'));
            console.log(chalk_1.default.yellow(`   1. Review the ${result.summary.criticalIssues} critical functions`));
            console.log(chalk_1.default.yellow(`   2. Check the report: ${outputBase}.md`));
            console.log(chalk_1.default.yellow(`   3. Use 'codegraph refactor' for specific functions\n`));
        }
    }
    catch (error) {
        spinner.fail();
        handleError(error, 'Batch analysis');
    }
});
//generates HTML report
program
    .command('report <directory>')
    .description('Generate interactive HTML report')
    .option('-o, --output <file>', 'Output HTML file path', 'codegraph-report.html')
    .action((directory, options) => {
    console.log(chalk_1.default.bold.cyan('\n📊 CodeGraph - HTML Report Generator\n'));
    // Validate input
    validateDirectory(directory);
    const spinner = (0, ora_1.default)('Analyzing codebase...').start();
    try {
        const analyzer = new analyzer_1.CodeAnalyzer();
        spinner.text = 'Scanning directory structure...';
        const graph = analyzer.analyzeDirectory(directory);
        const fileCount = analyzer.getFileCount();
        const complexity = analyzer.getComplexity();
        const totalFunctions = complexity.length;
        spinner.text = 'Generating HTML report...';
        //  Generate HTML report
        const reportGenerator = new report_generator_1.ReportGenerator();
        const projectName = path.basename(directory);
        const html = reportGenerator.generateHTMLReport(graph, complexity, fileCount, projectName);
        // Save report
        const outputPath = path.resolve(options.output);
        reportGenerator.saveHTMLReport(html, outputPath);
        spinner.succeed(chalk_1.default.green(`Analyzed ${fileCount} files, ${totalFunctions} functions`));
        console.log(chalk_1.default.green(`\n📄 HTML report saved to: ${outputPath}`));
        console.log(chalk_1.default.cyan(`\n💡 Open in browser: file://${outputPath}`));
        console.log(chalk_1.default.bold.green('\n✨ Report generated successfully!\n'));
        // quick preview
        console.log(chalk_1.default.yellow('Report includes:'));
        console.log(chalk_1.default.gray('  • Summary statistics'));
        console.log(chalk_1.default.gray('  • Complexity distribution chart'));
        console.log(chalk_1.default.gray('  • Top complex functions table'));
        console.log(chalk_1.default.gray('  • Architecture insights'));
        console.log(chalk_1.default.gray('  • Actionable recommendations\n'));
    }
    catch (error) {
        spinner.fail();
        handleError(error, 'Report generation');
    }
});
// REFACTOR COMMAND (AI required)
program
    .command('refactor <file> <functionName>')
    .description('Get AI refactoring suggestions for a function')
    .action(async (file, functionName) => {
    console.log(chalk_1.default.bold.cyan('\n🔧 AI Refactoring Suggestions\n'));
    // Validate inputs
    validateFile(file);
    const apiKey = getApiKey();
    const spinner = (0, ora_1.default)('Analyzing function...').start();
    try {
        const analyzer = new analyzer_1.CodeAnalyzer();
        const directory = path.dirname(file);
        spinner.text = 'Building call graph...';
        analyzer.analyzeDirectory(directory);
        spinner.text = 'Finding function...';
        const complexity = analyzer.getComplexity().find(c => c.name === functionName);
        if (!complexity) {
            spinner.fail(chalk_1.default.red(`Function "${functionName}" not found`));
            // Show available functions from the specific file
            const normalizedFile = path.resolve(file);
            const allFunctions = analyzer.getComplexity()
                .filter(c => path.resolve(c.file) === normalizedFile)
                .map(c => ({
                name: c.name,
                complexity: c.complexity,
                params: c.paramCount,
                lines: c.lineCount
            }));
            if (allFunctions.length > 0) {
                const functionNames = allFunctions.map(f => f.name);
                const closestMatch = findClosestMatch(functionName, functionNames);
                if (closestMatch) {
                    console.log(chalk_1.default.yellow(`\n💡 Did you mean: ${chalk_1.default.cyan(closestMatch)}?\n`));
                }
                console.log(chalk_1.default.yellow(`Available functions in ${chalk_1.default.cyan(path.basename(file))}:\n`));
                allFunctions.forEach(fn => {
                    const complexityWarning = fn.complexity > 10 ? chalk_1.default.red(' ⚠️') : chalk_1.default.green(' ✓');
                    const highlight = fn.name === closestMatch ? chalk_1.default.cyan('→ ') : '  ';
                    console.log(`${highlight}${chalk_1.default.cyan(fn.name)} ` +
                        chalk_1.default.gray(`(${fn.params} params, ${fn.lines} lines, complexity: ${fn.complexity})`) +
                        complexityWarning);
                });
                console.log(chalk_1.default.gray('\nTip: Function names are case-sensitive'));
            }
            console.log();
            process.exit(1);
        }
        // Extract function code
        const fileContent = fs.readFileSync(file, 'utf-8');
        const lines = fileContent.split('\n');
        const startLine = complexity.line - 1;
        const endLine = startLine + complexity.lineCount;
        const functionCode = lines.slice(startLine, endLine).join('\n');
        spinner.text = 'Generating refactoring suggestions...';
        const ai = new ai_1.AIService(apiKey);
        const suggestions = await ai.suggestRefactoring(functionName, functionCode, complexity.complexity);
        spinner.succeed(chalk_1.default.green('Analysis complete!'));
        console.log(chalk_1.default.bold(`\n Function: ${chalk_1.default.cyan(functionName)}`));
        console.log(chalk_1.default.gray(`   Location: ${file}:${complexity.line}`));
        console.log(chalk_1.default.gray(`   Complexity: ${complexity.complexity} ${complexity.complexity > 10 ? '⚠️' : '✅'}`));
        console.log(chalk_1.default.gray(`   Lines: ${complexity.lineCount}`));
        console.log(chalk_1.default.gray(`   Parameters: ${complexity.paramCount}\n`));
        console.log(chalk_1.default.bold('🔧 Refactoring Suggestions:\n'));
        console.log(suggestions);
        console.log();
    }
    catch (error) {
        spinner.fail();
        handleError(error, 'Refactoring analysis');
    }
});
// HELP & VERSION
program.addHelpText('after', `

Examples:
  # Basic analysis
  $ codegraph analyze ./src
  $ codegraph analyze ./src --format json --no-stats
  
  # HTML Report 
  $ codegraph report ./src
  $ codegraph report ./src --output my-report.html
  
  # AI-powered features
  $ codegraph explain ./src/utils.js calculateTotal
  $ codegraph analyze-complex ./src --threshold 15 --limit 5
  $ codegraph refactor ./src/complex.js processData
  
  # Batch analysis
  $ codegraph batch-explain ./src --threshold 10 --limit 20
  $ codegraph batch-explain D:/react/packages/react --output react-analysis

Features:
  • analyze: Fast complexity analysis (JSON/Mermaid)
  • report: Beautiful HTML reports with charts
  • batch-explain: AI analysis of all complex functions
  • explain/refactor: AI help for specific functions

Learn more:
  GitHub: https://github.com/UroojAshfa/codegraph
  
`);
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
