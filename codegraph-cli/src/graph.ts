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
  
  export class CallGraph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: GraphEdge[] = [];
    private dependencies: Map<string, string[]> = new Map();
    private complexityData: Map<string, ComplexityInfo> = new Map();
  
    addNode(name: string, file: string, line: number): void {
      // Use file + line as unique ID to handle same-named functions in different files/locations
      //const id = `${name}:${line}`;

      const id = `${name}`;
      
      if (!this.nodes.has(id)) {
        this.nodes.set(id, {
          id,
          label: name,
          file,
          line
        });
      }
    }

    
  
    addEdge(from: string, to: string, file: string, line: number): void {
      this.edges.push({ from, to, file, line });
    }
  
    getNode(name: string): GraphNode | undefined {
      return this.nodes.get(name);
    }
  
    getCallers(functionName: string): string[] {
      return this.edges
        .filter(edge => edge.to === functionName)
        .map(edge => edge.from)
        .filter((value, index, self) => self.indexOf(value) === index); 
    }
  
    getCallees(functionName: string): string[] {
      return this.edges
        .filter(edge => edge.from === functionName)
        .map(edge => edge.to)
        .filter((value, index, self) => self.indexOf(value) === index);
    }
  
    getAllNodes(): GraphNode[] {
      return Array.from(this.nodes.values());
    }
  
    getAllEdges(): GraphEdge[] {
      return this.edges;
    }

    addDependency(fromFile: string, toFile: string): void {
      if (!this.dependencies.has(fromFile)) {
        this.dependencies.set(fromFile, []);
      }
      this.dependencies.get(fromFile)!.push(toFile);
    }


    getMostImportedFiles(): Array<{ file: string; count: number }> {
      const importCounts = new Map<string, number>();
      
      for (const deps of this.dependencies.values()) {
        deps.forEach(file => {
          importCounts.set(file, (importCounts.get(file) || 0) + 1);
        });
      }
  
      return Array.from(importCounts.entries())
        .map(([file, count]) => ({ file, count }))
        .sort((a, b) => b.count - a.count);
    }

    getCircularDependencies(): string[][] {
      const cycles: string[][] = [];
      const visited = new Set<string>();
      const stack = new Set<string>();
  
      const dfs = (file: string, path: string[]): void => {
        if (stack.has(file)) {
          // Found a cycle
          const cycleStart = path.indexOf(file);
          if (cycleStart !== -1) {
            cycles.push(path.slice(cycleStart).concat(file));
          }
          return;
        }
  
        if (visited.has(file)) return;
  
        visited.add(file);
        stack.add(file);
        path.push(file);
  
        const deps = this.dependencies.get(file) || [];
        deps.forEach(dep => dfs(dep, [...path]));
  
        stack.delete(file);
      };
  
      for (const file of this.dependencies.keys()) {
        dfs(file, []);
      }
  
      return cycles;
    }
  
  
    getOrphanedFiles(allFiles: string[]): string[] {
      const importedFiles = new Set<string>();
      
      for (const deps of this.dependencies.values()) {
        deps.forEach(file => importedFiles.add(file));
      }
  
      return allFiles.filter(file => !importedFiles.has(file));
    }

    addComplexity(name: string, info: ComplexityInfo): void {
      this.complexityData.set(name, info);
    }
  
    toJSON() {
      return {
        nodes: Array.from(this.nodes.values()),
        edges: this.edges
      };
    }
  
    // Generate Mermaid diagram
    toMermaid(): string {
      let diagram = 'graph TD\n';
    
      // 1. Collect all node IDs (existing + referenced by edges)
      const allNodeIds = new Set<string>();
    
      this.nodes.forEach(node => {
        allNodeIds.add(node.id);
      });
    
      this.edges.forEach(edge => {
        allNodeIds.add(edge.from);
        allNodeIds.add(edge.to);
      });
    
      // 2. Helper to sanitize Mermaid node IDs
      const sanitize = (id: string) =>
        id.replace(/[^a-zA-Z0-9_]/g, '_');
    
      // 3. Emit all nodes (auto-create missing ones)
      allNodeIds.forEach(id => {
        const node = this.nodes.get(id);
    
        const safeId = sanitize(id);
        const label = node ? node.label : `${id} (external)`;
    
        diagram += `  ${safeId}["${label}"]\n`;
      });
    
      diagram += '\n';
    
      // 4. Emit edges using sanitized IDs
      this.edges.forEach(edge => {
        diagram += `  ${sanitize(edge.from)} --> ${sanitize(edge.to)}\n`;
      });
    
      return diagram;
    }
    
  
    printStats(): void {
      console.log('  GRAPH STATISTICS\n');
      console.log(`  Total nodes (functions): ${this.nodes.size}`);
      console.log(`  Total edges (calls): ${this.edges.length}\n`);
      
      // most called functions
      const callCounts = new Map<string, number>();
      this.edges.forEach(edge => {
        callCounts.set(edge.to, (callCounts.get(edge.to) || 0) + 1);
      });
  
      const sorted = Array.from(callCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
  
      if (sorted.length > 0) {
        console.log('   Most called functions:');
        sorted.forEach(([fn, count]) => {
          console.log(`     • ${fn}: called ${count} time${count > 1 ? 's' : ''}`);
        });
        console.log();
      }
  
      //entry points (functions not called by anyone)
      const called = new Set(this.edges.map(e => e.to));
      const entryPoints = Array.from(this.nodes.keys()).filter(name => !called.has(name));
  
      if (entryPoints.length > 0) {
        console.log(`  🚪 Entry points (not called by anyone): ${entryPoints.length}`);
        const display = entryPoints.slice(0, 5);
        display.forEach(fn => console.log(`     • ${fn}`));
        if (entryPoints.length > 5) {
          console.log(`     ... and ${entryPoints.length - 5} more`);
        }
        console.log();
      }
  
      //leaf functions (don't call anything)
      const callers = new Set(this.edges.map(e => e.from));
      const leaves = Array.from(this.nodes.keys()).filter(name => !callers.has(name));
  
      if (leaves.length > 0) {
        console.log(`   Leaf functions (don't call anything): ${leaves.length}`);
        const display = leaves.slice(0, 5);
        display.forEach(fn => console.log(`     • ${fn}`));
        if (leaves.length > 5) {
          console.log(`     ... and ${leaves.length - 5} more`);
        }
      }
      
      if (this.dependencies.size > 0) {
        console.log(`\n DEPENDENCY ANALYSIS\n`);
        console.log(`  Total files with imports: ${this.dependencies.size}`);
        
        const mostImported = this.getMostImportedFiles().slice(0, 5);
        if (mostImported.length > 0) {
          console.log(`\n   Most imported files:`);
          mostImported.forEach(({ file, count }) => {
            console.log(`     • ${file}: imported ${count} time${count > 1 ? 's' : ''}`);
          });
        }
  
        const cycles = this.getCircularDependencies();
        if (cycles.length > 0) {
          console.log(`\n    Circular dependencies found: ${cycles.length}`);
          cycles.slice(0, 3).forEach(cycle => {
            console.log(`     • ${cycle.join(' → ')}`);
          });
        } else {
          console.log(`\n   No circular dependencies detected`);
        }
      }

      if (this.complexityData.size > 0) {
        console.log(`\n COMPLEXITY ANALYSIS\n`);
        
        const complexityArray = Array.from(this.complexityData.values());
        
        // Average complexity
        const avgComplexity = complexityArray.reduce((sum, c) => sum + c.complexity, 0) / complexityArray.length;
        console.log(`  Average complexity: ${avgComplexity.toFixed(1)}`);
        
        // Most complex functions
        const mostComplex = complexityArray
          .sort((a, b) => b.complexity - a.complexity)
          .slice(0, 5);
        
        console.log(`\n   Most complex functions:`);
        mostComplex.forEach(c => {
          const warning = c.complexity > 10 ? ' ' : '';
          console.log(`     • ${c.name}: ${c.complexity}${warning} (${c.lineCount} lines)`);
        });
        
        // Long functions
        const longFunctions = complexityArray
          .filter(c => c.lineCount > 50)
          .sort((a, b) => b.lineCount - a.lineCount)
          .slice(0, 3);
        
        if (longFunctions.length > 0) {
          console.log(`\n  📏 Longest functions:`);
          longFunctions.forEach(c => {
            console.log(`     • ${c.name}: ${c.lineCount} lines (complexity: ${c.complexity})`);
          });
        }
        
        // Functions with many parameters
        const manyParams = complexityArray
          .filter(c => c.paramCount > 4)
          .sort((a, b) => b.paramCount - a.paramCount)
          .slice(0, 3);
        
        if (manyParams.length > 0) {
          console.log(`\n   Functions with many parameters:`);
          manyParams.forEach(c => {
            console.log(`     • ${c.name}: ${c.paramCount} parameters`);
          });
        }
      }
    }
  }
      
 