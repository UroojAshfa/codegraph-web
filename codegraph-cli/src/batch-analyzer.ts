// src/batch-analyzer.ts
import { AIService } from './ai';
import { ComplexityInfo } from './analyzer';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import * as fs from 'fs';

export interface FunctionAnalysis {
  name: string;
  file: string;
  line: number;
  complexity: number;
  lineCount: number;
  paramCount: number;
  aiAnalysis?: string;
  codeSmells?: string[];
  recommendation?: string;
  error?: string;
}

export interface BatchAnalysisResult {
  project: string;
  timestamp: string;
  summary: {
    totalFiles: number;
    totalFunctions: number;
    complexFunctions: number;
    analyzedCount: number;
    avgComplexity: number;
    maxComplexity: number;
    criticalIssues: number;
  };
  functions: FunctionAnalysis[];
}

export class BatchAnalyzer {
  private ai: AIService;
  private spinner: Ora;

  constructor(apiKey: string) {
    this.ai = new AIService(apiKey);
    this.spinner = ora();
  }

  async analyzeBatch(
    complexFunctions: ComplexityInfo[],
    threshold: number,
    limit: number,
    projectName: string,
    totalFiles: number,
    totalFunctions: number
  ): Promise<BatchAnalysisResult> {
    
    // Filter and sort by complexity
    const toAnalyze = complexFunctions
      .filter(fn => fn.complexity > threshold)
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, limit);

    console.log(chalk.bold.cyan('\n🤖 Batch AI Analysis\n'));
    console.log(chalk.gray('━'.repeat(60)));
    console.log(chalk.green(`√ Found ${totalFiles} files, ${totalFunctions} functions`));
    console.log(chalk.green(`√ Identified ${complexFunctions.filter(f => f.complexity > threshold).length} complex functions (>${threshold})`));
    console.log(chalk.yellow(`⚙️  Analyzing top ${toAnalyze.length} with AI...\n`));

    const results: FunctionAnalysis[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Analyze each function
    for (let i = 0; i < toAnalyze.length; i++) {
      const fn = toAnalyze[i];
      const progress = `[${i + 1}/${toAnalyze.length}]`;

      console.log(chalk.bold(`${progress} ${chalk.cyan(fn.name)} ${chalk.gray(`(complexity: ${fn.complexity})`)}`));
      console.log(chalk.gray(`  📍 ${fn.file}:${fn.line}`));

      this.spinner.start('  ⏱️  Analyzing with AI...');

      try {
        // Read function code from file
        const fileContent = fs.readFileSync(fn.file, 'utf-8');
        const lines = fileContent.split('\n');
        const startLine = fn.line - 1;
        const endLine = startLine + fn.lineCount;
        const functionCode = lines.slice(startLine, endLine).join('\n');

        // Get AI analysis
        const aiAnalysis = await this.ai.analyzeComplexity(
          fn.name,
          fn.complexity,
          fn.lineCount
        );

        // Detect code smells
        const codeSmells = await this.ai.detectCodeSmells(
          functionCode,
          fn.complexity,
          fn.lineCount,
          fn.paramCount
        );

        // Get refactoring suggestions
        const recommendation = await this.ai.suggestRefactoring(
          fn.name,
          functionCode,
          fn.complexity
        );

        this.spinner.succeed(chalk.green('  ✓ Analysis complete'));

        results.push({
          ...fn,
          aiAnalysis,
          codeSmells: codeSmells.filter(s => s !== 'No obvious code smells detected ✅'),
          recommendation
        });

        successCount++;

        // Show brief summary
        if (codeSmells.length > 0 && codeSmells[0] !== 'No obvious code smells detected ✅') {
          console.log(chalk.yellow(`  ⚠️  ${codeSmells.length} code smell(s) detected`));
        } else {
          console.log(chalk.green(`  ✅ No major issues`));
        }

        console.log(); // Blank line between functions

        // Rate limiting: wait 1 second between requests
        if (i < toAnalyze.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        this.spinner.fail(chalk.red('  ✗ Analysis failed'));
        
        results.push({
          ...fn,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        errorCount++;
        console.log(chalk.gray(`  (Skipping this function)\n`));
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

    const criticalIssues = analyzedFunctions.filter(fn => 
      fn.complexity > 20 || 
      (fn.codeSmells && fn.codeSmells.length >= 3)
    ).length;

    // Print summary
    console.log(chalk.gray('━'.repeat(60)));
    console.log(chalk.bold('\n📊 Summary:\n'));
    console.log(chalk.green(`  • Analyzed: ${successCount} functions`));
    if (errorCount > 0) {
      console.log(chalk.red(`  • Failed: ${errorCount} functions`));
    }
    console.log(chalk.yellow(`  • Avg complexity: ${avgComplexity.toFixed(1)}`));
    console.log(chalk.yellow(`  • Max complexity: ${maxComplexity}`));
    if (criticalIssues > 0) {
      console.log(chalk.red(`  • Critical issues: ${criticalIssues} functions need refactoring`));
    } else {
      console.log(chalk.green(`  • No critical issues found`));
    }

    const totalSmells = analyzedFunctions.reduce((sum, fn) => 
      sum + (fn.codeSmells ? fn.codeSmells.length : 0), 0
    );
    if (totalSmells > 0) {
      console.log(chalk.yellow(`  • Code smells found: ${totalSmells}`));
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
  generateMarkdownReport(result: BatchAnalysisResult): string {
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
  async saveResults(result: BatchAnalysisResult, outputBase: string): Promise<void> {
    // Save JSON
    const jsonFile = `${outputBase}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(result, null, 2));
    console.log(chalk.green(`\n💾 JSON saved to: ${jsonFile}`));

    // Save Markdown
    const markdown = this.generateMarkdownReport(result);
    const mdFile = `${outputBase}.md`;
    fs.writeFileSync(mdFile, markdown);
    console.log(chalk.green(`📄 Report saved to: ${mdFile}`));
  }
}