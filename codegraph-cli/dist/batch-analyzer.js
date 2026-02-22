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
exports.BatchAnalyzer = void 0;
// src/batch-analyzer.ts
const ai_1 = require("./ai");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs"));
class BatchAnalyzer {
    constructor(apiKey) {
        this.ai = new ai_1.AIService(apiKey);
        this.spinner = (0, ora_1.default)();
    }
    async analyzeBatch(complexFunctions, threshold, limit, projectName, totalFiles, totalFunctions) {
        // Filter and sort by complexity
        const toAnalyze = complexFunctions
            .filter(fn => fn.complexity > threshold)
            .sort((a, b) => b.complexity - a.complexity)
            .slice(0, limit);
        console.log(chalk_1.default.bold.cyan('\n🤖 Batch AI Analysis\n'));
        console.log(chalk_1.default.gray('━'.repeat(60)));
        console.log(chalk_1.default.green(`√ Found ${totalFiles} files, ${totalFunctions} functions`));
        console.log(chalk_1.default.green(`√ Identified ${complexFunctions.filter(f => f.complexity > threshold).length} complex functions (>${threshold})`));
        console.log(chalk_1.default.yellow(`⚙️  Analyzing top ${toAnalyze.length} with AI...\n`));
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        // Analyze each function
        for (let i = 0; i < toAnalyze.length; i++) {
            const fn = toAnalyze[i];
            const progress = `[${i + 1}/${toAnalyze.length}]`;
            console.log(chalk_1.default.bold(`${progress} ${chalk_1.default.cyan(fn.name)} ${chalk_1.default.gray(`(complexity: ${fn.complexity})`)}`));
            console.log(chalk_1.default.gray(`  📍 ${fn.file}:${fn.line}`));
            this.spinner.start('  ⏱️  Analyzing with AI...');
            try {
                // Read function code from file
                const fileContent = fs.readFileSync(fn.file, 'utf-8');
                const lines = fileContent.split('\n');
                const startLine = fn.line - 1;
                const endLine = startLine + fn.lineCount;
                const functionCode = lines.slice(startLine, endLine).join('\n');
                // Get AI analysis
                const aiAnalysis = await this.ai.analyzeComplexity(fn.name, fn.complexity, fn.lineCount);
                // Detect code smells
                const codeSmells = await this.ai.detectCodeSmells(functionCode, fn.complexity, fn.lineCount, fn.paramCount);
                // Get refactoring suggestions
                const recommendation = await this.ai.suggestRefactoring(fn.name, functionCode, fn.complexity);
                this.spinner.succeed(chalk_1.default.green('  ✓ Analysis complete'));
                results.push({
                    ...fn,
                    aiAnalysis,
                    codeSmells: codeSmells.filter(s => s !== 'No obvious code smells detected ✅'),
                    recommendation
                });
                successCount++;
                // Show brief summary
                if (codeSmells.length > 0 && codeSmells[0] !== 'No obvious code smells detected ✅') {
                    console.log(chalk_1.default.yellow(`  ⚠️  ${codeSmells.length} code smell(s) detected`));
                }
                else {
                    console.log(chalk_1.default.green(`  ✅ No major issues`));
                }
                console.log(); // Blank line between functions
                // Rate limiting: wait 1 second between requests
                if (i < toAnalyze.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            catch (error) {
                this.spinner.fail(chalk_1.default.red('  ✗ Analysis failed'));
                results.push({
                    ...fn,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                errorCount++;
                console.log(chalk_1.default.gray(`  (Skipping this function)\n`));
            }
        }
        // Calculate summary statistics
        const analyzedFunctions = results.filter(r => !r.error);
        const avgComplexity = analyzedFunctions.length > 0
            ? analyzedFunctions.reduce((sum, fn) => sum + fn.complexity, 0) / analyzedFunctions.length
            : 0;
        const maxComplexity = analyzedFunctions.length > 0
            ? Math.max(...analyzedFunctions.map(fn => fn.complexity))
            : 0;
        const criticalIssues = analyzedFunctions.filter(fn => fn.complexity > 20 ||
            (fn.codeSmells && fn.codeSmells.length >= 3)).length;
        // Print summary
        console.log(chalk_1.default.gray('━'.repeat(60)));
        console.log(chalk_1.default.bold('\n📊 Summary:\n'));
        console.log(chalk_1.default.green(`  • Analyzed: ${successCount} functions`));
        if (errorCount > 0) {
            console.log(chalk_1.default.red(`  • Failed: ${errorCount} functions`));
        }
        console.log(chalk_1.default.yellow(`  • Avg complexity: ${avgComplexity.toFixed(1)}`));
        console.log(chalk_1.default.yellow(`  • Max complexity: ${maxComplexity}`));
        if (criticalIssues > 0) {
            console.log(chalk_1.default.red(`  • Critical issues: ${criticalIssues} functions need refactoring`));
        }
        else {
            console.log(chalk_1.default.green(`  • No critical issues found`));
        }
        const totalSmells = analyzedFunctions.reduce((sum, fn) => sum + (fn.codeSmells ? fn.codeSmells.length : 0), 0);
        if (totalSmells > 0) {
            console.log(chalk_1.default.yellow(`  • Code smells found: ${totalSmells}`));
        }
        // Return structured result
        return {
            project: projectName,
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles,
                totalFunctions,
                complexFunctions: complexFunctions.filter(f => f.complexity > threshold).length,
                analyzedCount: successCount,
                avgComplexity: parseFloat(avgComplexity.toFixed(2)),
                maxComplexity,
                criticalIssues
            },
            functions: results
        };
    }
    // Generate markdown report
    generateMarkdownReport(result) {
        let md = `# Code Analysis Report: ${result.project}\n\n`;
        md += `**Generated:** ${new Date(result.timestamp).toLocaleString()}\n\n`;
        md += `---\n\n`;
        // Summary section
        md += `## Summary\n\n`;
        md += `- **Files:** ${result.summary.totalFiles}\n`;
        md += `- **Functions:** ${result.summary.totalFunctions}\n`;
        md += `- **Complex Functions:** ${result.summary.complexFunctions}\n`;
        md += `- **Analyzed:** ${result.summary.analyzedCount}\n`;
        md += `- **Avg Complexity:** ${result.summary.avgComplexity.toFixed(1)}\n`;
        md += `- **Max Complexity:** ${result.summary.maxComplexity}\n`;
        md += `- **Critical Issues:** ${result.summary.criticalIssues}\n\n`;
        // Critical functions section
        const criticalFunctions = result.functions
            .filter(f => !f.error)
            .sort((a, b) => b.complexity - a.complexity);
        if (criticalFunctions.length > 0) {
            md += `## Analyzed Functions\n\n`;
            criticalFunctions.forEach((fn, index) => {
                md += `### ${index + 1}. ${fn.name} (complexity: ${fn.complexity}) ${fn.complexity > 20 ? '⚠️' : ''}\n\n`;
                md += `**Location:** \`${fn.file}:${fn.line}\`  \n`;
                md += `**Lines:** ${fn.lineCount} | **Parameters:** ${fn.paramCount}\n\n`;
                if (fn.aiAnalysis) {
                    md += `**AI Analysis:**\n`;
                    md += `${fn.aiAnalysis}\n\n`;
                }
                if (fn.codeSmells && fn.codeSmells.length > 0) {
                    md += `**Code Smells:**\n`;
                    fn.codeSmells.forEach(smell => {
                        md += `- ${smell}\n`;
                    });
                    md += `\n`;
                }
                if (fn.recommendation && fn.complexity >= 8) {
                    md += `**Refactoring Suggestions:**\n`;
                    md += `${fn.recommendation}\n\n`;
                }
                md += `---\n\n`;
            });
        }
        // Errors section
        const errors = result.functions.filter(f => f.error);
        if (errors.length > 0) {
            md += `## Analysis Errors\n\n`;
            errors.forEach(fn => {
                md += `- **${fn.name}** (\`${fn.file}:${fn.line}\`): ${fn.error}\n`;
            });
            md += `\n`;
        }
        // Recommendations section
        md += `## Overall Recommendations\n\n`;
        if (result.summary.criticalIssues > 0) {
            md += `⚠️ **${result.summary.criticalIssues} functions** require immediate attention due to high complexity or multiple code smells.\n\n`;
        }
        const highComplexity = criticalFunctions.filter(f => f.complexity > 15).length;
        if (highComplexity > 0) {
            md += `🔴 **${highComplexity} functions** have complexity >15 (industry threshold for high risk)\n\n`;
        }
        const longFunctions = criticalFunctions.filter(f => f.lineCount > 50).length;
        if (longFunctions > 0) {
            md += `📏 **${longFunctions} functions** exceed 50 lines (consider breaking down)\n\n`;
        }
        md += `---\n\n`;
        md += `*Generated by CodeGraph - AI-powered code analysis*\n`;
        return md;
    }
    // Save results to files
    async saveResults(result, outputBase) {
        // Save JSON
        const jsonFile = `${outputBase}.json`;
        fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2));
        console.log(chalk_1.default.green(`\n💾 JSON saved to: ${jsonFile}`));
        // Save Markdown
        const markdown = this.generateMarkdownReport(result);
        const mdFile = `${outputBase}.md`;
        fs.writeFileSync(mdFile, markdown);
        console.log(chalk_1.default.green(`📄 Report saved to: ${mdFile}`));
    }
}
exports.BatchAnalyzer = BatchAnalyzer;
