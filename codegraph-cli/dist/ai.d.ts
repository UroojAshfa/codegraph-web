export declare class AIService {
    private genAI;
    private model;
    constructor(apiKey: string);
    explainFunction(functionName: string, functionCode: string, complexity: number, callers: string[], callees: string[]): Promise<string>;
    analyzeComplexity(functionName: string, complexity: number, lineCount: number): Promise<string>;
    suggestRefactoring(functionName: string, functionCode: string, complexity: number): Promise<string>;
    detectCodeSmells(functionCode: string, complexity: number, lineCount: number, paramCount: number): Promise<string[]>;
}
//# sourceMappingURL=ai.d.ts.map