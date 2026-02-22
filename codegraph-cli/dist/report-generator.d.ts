import { ComplexityInfo } from './analyzer';
import { CallGraph } from './graph';
export interface ReportData {
    projectName: string;
    timestamp: string;
    fileCount: number;
    functionCount: number;
    avgComplexity: number;
    maxComplexity: number;
    complexityDistribution: {
        range: string;
        count: number;
        percentage: number;
    }[];
    topComplexFunctions: ComplexityInfo[];
    entryPoints: number;
    leafFunctions: number;
    circularDependencies: number;
    mostImportedFiles: Array<{
        file: string;
        count: number;
    }>;
}
export declare class ReportGenerator {
    generateHTMLReport(graph: CallGraph, complexity: ComplexityInfo[], fileCount: number, projectName: string): string;
    private prepareReportData;
    private buildHTML;
    private getComplexityClass;
    private generateRecommendations;
    saveHTMLReport(html: string, outputPath: string): void;
}
//# sourceMappingURL=report-generator.d.ts.map