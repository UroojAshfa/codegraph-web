
// app/api/analyze/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { CodeAnalyzer } from "@/lib/analyzer/analyzer";

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files uploaded" },
        { status: 400 }
      );
    }

    if (files.length > 100) {
      return NextResponse.json(
        { success: false, error: "Maximum 100 files allowed" },
        { status: 400 }
      );
    }

    // Create temp directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codegraph-"));

    // Write uploaded files
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = path.basename(file.name);
      fs.writeFileSync(path.join(tempDir, safeName), buffer);
    }

    // Analyze using local CodeAnalyzer
    const analyzer = new CodeAnalyzer();
    analyzer.analyzeDirectory(tempDir);  // ✅ Only 1 argument

    // Get complexity data
    const complexity = analyzer.getComplexity();

    // Calculate stats
    const avgComplexity = complexity.length > 0
      ? complexity.reduce((sum, c) => sum + c.complexity, 0) / complexity.length
      : 0;

    const maxComplexity = complexity.length > 0
      ? Math.max(...complexity.map(c => c.complexity))
      : 0;

    // Complexity distribution
    const distribution = [
      { range: "1-5", count: 0, percentage: 0 },
      { range: "6-10", count: 0, percentage: 0 },
      { range: "11-15", count: 0, percentage: 0 },
      { range: "16-20", count: 0, percentage: 0 },
      { range: "21+", count: 0, percentage: 0 },
    ];

    complexity.forEach(c => {
      if (c.complexity <= 5) distribution[0].count++;
      else if (c.complexity <= 10) distribution[1].count++;
      else if (c.complexity <= 15) distribution[2].count++;
      else if (c.complexity <= 20) distribution[3].count++;
      else distribution[4].count++;
    });

    distribution.forEach(d => {
      d.percentage = complexity.length > 0
        ? Math.round((d.count / complexity.length) * 100)
        : 0;
    });

    // Top complex functions
    const topComplex = [...complexity]
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 10);

    // Try to get graph data if analyzer exposes it
    let nodes: any[] = [];
    let edges: any[] = [];
    let entryPoints = 0;
    let leafFunctions = 0;
    let circularDependencies: any[] = [];

    // Check if analyzer has a graph property
    if ((analyzer as any).graph) {
      const graph = (analyzer as any).graph;
      nodes = graph.getAllNodes ? graph.getAllNodes() : [];
      edges = graph.getAllEdges ? graph.getAllEdges() : [];
      
      if (nodes.length > 0 && edges.length > 0) {
        const calledSet = new Set(edges.map((e: any) => e.to));
        const callerSet = new Set(edges.map((e: any) => e.from));
        
        entryPoints = nodes.filter((n: any) => !calledSet.has(n.id)).length;
        leafFunctions = nodes.filter((n: any) => !callerSet.has(n.id)).length;
      }
      
      if (graph.getCircularDependencies) {
        circularDependencies = graph.getCircularDependencies();
      }
    }

    const result = {
      fileCount: files.length,
      functionCount: complexity.length,
      avgComplexity: parseFloat(avgComplexity.toFixed(2)),
      maxComplexity,
      functions: complexity.map(c => ({
        name: c.name,
        file: c.file,
        line: c.line,
      })),
      complexity,
      graph: { 
        nodes: nodes.map((n: any) => ({
          id: n.id,
          label: n.label || n.id,
          file: n.file,
          line: n.line,
        })), 
        edges 
      },
      imports: analyzer.getImports ? analyzer.getImports() : [],
      exports: analyzer.getExports ? analyzer.getExports() : [],
      circularDependencies,
      distribution,
      topComplex,
      entryPoints,
      leafFunctions,
    };

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        console.error("Cleanup failed:", e);
      }
    }
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "CodeGraph API is running",
    version: "1.0.0",
  });
}












// // app/api/analyze/route.ts
// // Uses CodeGraph CLI as child process - avoids ALL tree-sitter native issues!
// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';

// import { NextRequest, NextResponse } from "next/server";
// import * as fs from "fs";
// import * as path from "path";
// import * as os from "os";
// import { execSync } from "child_process";

// // Matches your CLI's output.json exactly
// interface CLINode {
//   id: string;
//   label: string;
//   file: string;
//   line: number;
// }

// interface CLIEdge {
//   from: string;
//   to: string;
//   file: string;
//   line: number;
// }

// interface CLIOutput {
//   nodes: CLINode[];
//   edges: CLIEdge[];
// }

// // Built-in JS methods to filter out (not real functions in your code)
// const BUILTIN_METHODS = new Set([
//   'log', 'push', 'forEach', 'filter', 'map', 'childForFieldName',
//   'includes', 'set', 'get', 'has', 'join', 'slice', 'sort', 'find',
//   'reduce', 'replace', 'split', 'trim', 'toString', 'toFixed',
//   'startsWith', 'endsWith', 'child', 'add', 'delete', 'keys',
//   'values', 'entries', 'from', 'concat', 'indexOf', 'repeat',
//   'readFileSync', 'writeFileSync', 'existsSync', 'readdirSync',
//   'statSync', 'parse', 'stringify', 'error', 'warn', 'info',
//   'charAt', 'substring', 'toUpperCase', 'toLowerCase', 'toISOString',
//   'toLocaleString', 'parseInt', 'parseFloat', 'isDirectory', 'isFile',
//   'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
// ]);

// export async function POST(request: NextRequest) {
//   let tempDir: string | null = null;

//   try {
//     const formData = await request.formData();
//     const files = formData.getAll("files") as File[];

//     if (!files || files.length === 0) {
//       return NextResponse.json(
//         { success: false, error: "No files uploaded" },
//         { status: 400 }
//       );
//     }

//     if (files.length > 100) {
//       return NextResponse.json(
//         { success: false, error: "Maximum 100 files allowed" },
//         { status: 400 }
//       );
//     }

//     // Write uploaded files to temp directory
//     tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codegraph-"));

//     for (const file of files) {
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);
//       const safeName = path.basename(file.name);
//       fs.writeFileSync(path.join(tempDir, safeName), buffer);
//     }

 
    
//     const codegraphDir = 'D:\\codegraph';

    
//     execSync(
//       `node "${codegraphDir}\\dist\\cli.js" analyze "${tempDir}"`,
//       {
//         timeout: 30000,
//         cwd: codegraphDir,  // output.json saves here
//       }
//     );

//     // Read the output.json the CLI generated
//     const jsonPath = path.join(codegraphDir, 'output.json');

//     if (!fs.existsSync(jsonPath)) {
//       throw new Error(
//         `CLI ran but output.json not found at ${jsonPath}. ` +
//         `Check that your codegraph path is correct.`
//       );
//     }

//     const rawOutput = fs.readFileSync(jsonPath, 'utf-8');
//     const cliOutput: CLIOutput = JSON.parse(rawOutput);

//     // Transform into web app format
//     const result = transformOutput(cliOutput, files.length);

//     return NextResponse.json({ success: true, data: result });

//   } catch (error) {
//     console.error("Analysis error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Analysis failed",
//       },
//       { status: 500 }
//     );
//   } finally {
//     if (tempDir && fs.existsSync(tempDir)) {
//       try {
//         fs.rmSync(tempDir, { recursive: true, force: true });
//       } catch (e) {
//         console.error("Cleanup failed:", e);
//       }
//     }
//   }
// }

// function transformOutput(cliOutput: CLIOutput, fileCount: number) {
//   const { nodes, edges } = cliOutput;

//   // ── Filter to real functions only 
//   const realNodes = nodes.filter(n => !BUILTIN_METHODS.has(n.id));

//   // ── Calculate complexity from call graph (out-degree proxy) 

//   const outDegreeMap = new Map<string, number>();
//   edges.forEach(e => {
//     if (!BUILTIN_METHODS.has(e.from)) {
//       outDegreeMap.set(e.from, (outDegreeMap.get(e.from) || 0) + 1);
//     }
//   });

//   const complexity = realNodes.map(node => {
//     const callCount = outDegreeMap.get(node.id) || 0;
//     const complexityScore = Math.max(1, Math.ceil(1 + callCount / 3));
//     return {
//       name: node.label,
//       file: node.file,
//       line: node.line,
//       complexity: complexityScore,
//       lineCount: 0,
//       paramCount: 0,
//     };
//   });

//   // Stats
//   const avgComplexity = complexity.length > 0
//     ? complexity.reduce((sum, c) => sum + c.complexity, 0) / complexity.length
//     : 0;

//   const maxComplexity = complexity.length > 0
//     ? Math.max(...complexity.map(c => c.complexity))
//     : 0;

//   // Complexity distribution 
//   const distribution = [
//     { range: "1-5", count: 0, percentage: 0 },
//     { range: "6-10", count: 0, percentage: 0 },
//     { range: "11-15", count: 0, percentage: 0 },
//     { range: "16-20", count: 0, percentage: 0 },
//     { range: "21+", count: 0, percentage: 0 },
//   ];

//   complexity.forEach(c => {
//     if (c.complexity <= 5) distribution[0].count++;
//     else if (c.complexity <= 10) distribution[1].count++;
//     else if (c.complexity <= 15) distribution[2].count++;
//     else if (c.complexity <= 20) distribution[3].count++;
//     else distribution[4].count++;
//   });

//   distribution.forEach(d => {
//     d.percentage = complexity.length > 0
//       ? Math.round((d.count / complexity.length) * 100)
//       : 0;
//   });

//   // Top complex
//   const topComplex = [...complexity]
//     .sort((a, b) => b.complexity - a.complexity)
//     .slice(0, 10);

//   // Entry points & leaves 
//   const calledSet = new Set(edges.map(e => e.to));
//   const callerSet = new Set(edges.map(e => e.from));
//   const entryPoints = realNodes.filter(n => !calledSet.has(n.id)).length;
//   const leafFunctions = realNodes.filter(n => !callerSet.has(n.id)).length;

//   //  Unique files 
//   const uniqueFiles = new Set(nodes.map(n => n.file));

//   return {
//     fileCount: uniqueFiles.size || fileCount,
//     functionCount: complexity.length,
//     avgComplexity: parseFloat(avgComplexity.toFixed(2)),
//     maxComplexity,
//     functions: realNodes.map(n => ({
//       name: n.label,
//       file: n.file,
//       line: n.line,
//     })),
//     complexity,
//     graph: { nodes, edges },
//     imports: [],
//     exports: [],
//     circularDependencies: [],
//     distribution,
//     topComplex,
//     entryPoints,
//     leafFunctions,
//   };
// }

// export async function GET() {
//   return NextResponse.json({
//     status: "ok",
//     message: "CodeGraph API is running",
//     version: "1.0.0",
//   });
// }