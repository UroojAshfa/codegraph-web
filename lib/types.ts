// lib/types.ts
// TypeScript types for CodeGraph Web

/* Function information from analyzer */
export interface FunctionInfo {
    name: string;
    file: string;
    line: number;
  }
  
  /* Complexity information for a function*/
  export interface ComplexityInfo {
    name: string;
    file: string;
    line: number;
    complexity: number;
    lineCount: number;
    paramCount: number;
  }
  
  /* Call graph node */
  export interface GraphNode {
    id: string;
    label: string;
    file: string;
    line: number;
    type?: "function" | "arrow" | "method" | "async";
  }
  
  /* Call graph edge (function call) */
  export interface GraphEdge {
    from: string;
    to: string;
    file: string;
    line: number;
  }
  
  /*Import/Export information */
  export interface ImportInfo {
    file: string;
    imports: string[];
    line: number;
  }
  
  export interface ExportInfo {
    file: string;
    exports: string[];
    line: number;
  }
  
  /* Complete analysis result */
  export interface AnalysisResult {
    // Summary stats
    fileCount: number;
    functionCount: number;
    avgComplexity: number;
    maxComplexity: number;
    
    // Detailed data
    functions: FunctionInfo[];
    complexity: ComplexityInfo[];
    graph: {
      nodes: GraphNode[];
      edges: GraphEdge[];
    };
    
    // Dependencies
    imports: ImportInfo[];
    exports: ExportInfo[];
    circularDependencies: string[][];
    
    // Complexity distribution
    distribution: {
      range: string;
      count: number;
      percentage: number;
    }[];
    
    // Top complex functions
    topComplex: ComplexityInfo[];
    
    // Architecture insights
    entryPoints: number;
    leafFunctions: number;
  }
  
  /* File upload state */
  export interface UploadedFile {
    name: string;
    path: string;
    content: string;
    size: number;
  }
  
  /*Analysis status */
  export type AnalysisStatus = 
    | "idle"
    | "uploading"
    | "analyzing"
    | "complete"
    | "error";
  
  /* Analysis error */
  export interface AnalysisError {
    message: string;
    file?: string;
    line?: number;
  }
  
  /* Complexity level type */
  export type ComplexityLevel = 
    | "PRISTINE"   // 1-5
    | "CLEAN"      // 6-10
    | "MODERATE"   // 11-15
    | "COMPLEX"    // 16-20
    | "CRITICAL";  // 21+
  
  /* Chart data for complexity distribution */
  export interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  }
  
  /* Function detail view props */
  export interface FunctionDetail {
    name: string;
    file: string;
    line: number;
    complexity: number;
    lineCount: number;
    paramCount: number;
    callers: string[];
    callees: string[];
    code?: string;
    aiAnalysis?: string;
    codeSmells?: string[];
    recommendations?: string;
  }
  
  /*Export format options */
  export type ExportFormat = "json" | "html" | "markdown" | "csv";
  
  /*Filter options for function table */
  export interface FilterOptions {
    searchQuery: string;
    minComplexity: number;
    maxComplexity: number;
    complexityLevel?: ComplexityLevel;
    fileFilter?: string;
  }
  
  /* Sort options for function table */
  export type SortField = "name" | "complexity" | "lines" | "params" | "file";
  export type SortDirection = "asc" | "desc";
  
  export interface SortOptions {
    field: SortField;
    direction: SortDirection;
  }
  
  /* Example project for demos */
  export interface ExampleProject {
    id: string;
    name: string;
    description: string;
    files: UploadedFile[];
    thumbnail?: string;
  }
  
  /*  Theme mode */
  export type ThemeMode = "light" | "dark" | "system";
  
  /* API response wrapper */
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
  }
  
  /* Progress update during analysis */
  export interface AnalysisProgress {
    stage: "parsing" | "analyzing" | "building-graph" | "calculating-metrics";
    progress: number; // 0-100
    message: string;
    currentFile?: string;
  }