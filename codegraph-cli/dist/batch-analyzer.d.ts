import { ComplexityInfo } from './analyzer';
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
export declare class BatchAnalyzer {
    private ai;
    private spinner;
    constructor(apiKey: string);
    analyzeBatch(complexFunctions: ComplexityInfo[], threshold: number, limit: number, projectName: string, totalFiles: number, totalFunctions: number): Promise<BatchAnalysisResult>;
    generateMarkdownReport(result: BatchAnalysisResult): string;
    saveResults(result: BatchAnalysisResult, outputBase: string): Promise<void>;
}
//# sourceMappingURL=batch-analyzer.d.ts.map