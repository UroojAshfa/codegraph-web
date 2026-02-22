import { CallGraph } from './graph';
interface ImportInfo {
    file: string;
    imports: string[];
    line: number;
}
interface ExportInfo {
    file: string;
    exports: string[];
    line: number;
}
export interface ComplexityInfo {
    name: string;
    file: string;
    line: number;
    complexity: number;
    lineCount: number;
    paramCount: number;
}
export declare class CodeAnalyzer {
    private jsParser;
    private tsParser;
    private functions;
    private calls;
    private fileCount;
    private exportedFunctions;
    private imports;
    private exports;
    private complexity;
    constructor();
    private findJSFiles;
    private extractFunctions;
    private extractObjectMethods;
    private extractCalls;
    private extractImportsExports;
    private analyzeFile;
    private calculateComplexity;
    analyzeDirectory(directory: string): CallGraph;
    getFileCount(): number;
    getImports(): ImportInfo[];
    getExports(): ExportInfo[];
    getComplexity(): ComplexityInfo[];
}
export {};
//# sourceMappingURL=analyzer.d.ts.map