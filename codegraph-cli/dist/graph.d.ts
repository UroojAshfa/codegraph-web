import { ComplexityInfo } from './analyzer';
export interface GraphNode {
    id: string;
    label: string;
    file: string;
    line: number;
    type?: 'function' | 'arrow' | 'method' | 'async';
}
export interface GraphEdge {
    from: string;
    to: string;
    file: string;
    line: number;
}
export declare class CallGraph {
    private nodes;
    private edges;
    private dependencies;
    private complexityData;
    addNode(name: string, file: string, line: number): void;
    addEdge(from: string, to: string, file: string, line: number): void;
    getNode(name: string): GraphNode | undefined;
    getCallers(functionName: string): string[];
    getCallees(functionName: string): string[];
    getAllNodes(): GraphNode[];
    getAllEdges(): GraphEdge[];
    addDependency(fromFile: string, toFile: string): void;
    getMostImportedFiles(): Array<{
        file: string;
        count: number;
    }>;
    getCircularDependencies(): string[][];
    getOrphanedFiles(allFiles: string[]): string[];
    addComplexity(name: string, info: ComplexityInfo): void;
    toJSON(): {
        nodes: GraphNode[];
        edges: GraphEdge[];
    };
    toMermaid(): string;
    printStats(): void;
}
//# sourceMappingURL=graph.d.ts.map