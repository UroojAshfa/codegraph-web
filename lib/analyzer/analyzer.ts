
//
import * as fs from 'fs';
import * as path from 'path';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import { CallGraph } from './graph';

interface FunctionInfo {
  name: string;
  file: string;
  line: number;
}

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

interface FunctionCall {
  caller: string;
  callee: string;
  file: string;
  line: number;
}

interface AnalysisResult {
  functions: FunctionInfo[];
  calls: FunctionCall[];
}

export interface ComplexityInfo {
  name: string;
  file: string;
  line: number;
  complexity: number;
  lineCount: number;
  paramCount: number;
}

export class CodeAnalyzer {
  private jsParser: Parser;
  private tsParser: Parser;
  private functions: FunctionInfo[] = [];
  private calls: FunctionCall[] = [];
  private fileCount: number = 0; 
  private exportedFunctions = new Set<string>();
  private imports: ImportInfo[] = [];     
  private exports: ExportInfo[] = [];
  private complexity: ComplexityInfo[] = [];

  constructor() {
    this.jsParser = new Parser();
    this.jsParser.setLanguage(JavaScript);

    this.tsParser = new Parser();
    this.tsParser.setLanguage(TypeScript.typescript);
  }

  private findJSFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (item === 'node_modules' || item.startsWith('.')) {
          continue;
        }
        files.push(...this.findJSFiles(fullPath));
      } else if (
        item.endsWith('.js') || 
        item.endsWith('.ts') || 
        item.endsWith('.jsx') || 
        item.endsWith('.tsx')
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private extractFunctions(tree: Parser.Tree, filePath: string): void {
    const visit = (node: Parser.SyntaxNode) => {

      // 1. Regular function declarations
      if (node.type === 'function_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          this.functions.push({
            name: nameNode.text,
            file: filePath,
            line: nameNode.startPosition.row + 1
          });
          this.calculateComplexity(node, nameNode.text, filePath);
        }
      }

      // 2. Assignment expressions (module.exports, obj.method = fn, simple assignments)
      if (node.type === 'assignment_expression') {
        const left = node.childForFieldName('left');
        const right = node.childForFieldName('right');

        // module.exports = IDENTIFIER
        if (
          left?.type === 'member_expression' &&
          left.text === 'module.exports' &&
          right?.type === 'identifier'
        ) {
          this.exportedFunctions.add(right.text);
        }

        // Method/function assignments
        if (right && (
          right.type === 'function' || 
          right.type === 'function_expression' ||
          right.type === 'arrow_function'
        )) {
          // obj.method = function() {} or obj.method = () => {}
          if (left && left.type === 'member_expression') {
            const propertyNode = left.childForFieldName('property');
            const objectNode = left.childForFieldName('object');
            
            if (propertyNode && objectNode) {
              const functionName = `${objectNode.text}.${propertyNode.text}`;
              
              this.functions.push({
                name: functionName,
                file: filePath,
                line: propertyNode.startPosition.row + 1
              });
              
              this.calculateComplexity(right, functionName, filePath);
            }
          }
          // Simple assignment: myVar = function() {}
          else if (left && left.type === 'identifier') {
            this.functions.push({
              name: left.text,
              file: filePath,
              line: left.startPosition.row + 1
            });
            this.calculateComplexity(right, left.text, filePath);
          }
        }
      }
      
      // 3. Arrow functions and object literals: const add = () => {} or const obj = {...}
      if (node.type === 'variable_declarator') {
        const nameNode = node.childForFieldName('name');
        const valueNode = node.childForFieldName('value');
        
        // Arrow function: const add = () => {}
        if (nameNode && valueNode && valueNode.type === 'arrow_function') {
          this.functions.push({
            name: nameNode.text,
            file: filePath,
            line: nameNode.startPosition.row + 1
          });
          this.calculateComplexity(valueNode, nameNode.text, filePath);
        }

        // 🆕 FIX BUG #4: Object literal with methods
        // const obj = { method() {}, arrow: () => {}, traditional: function() {} }
        if (nameNode && valueNode && valueNode.type === 'object') {
          const objectName = nameNode.text;
          this.extractObjectMethods(valueNode, objectName, filePath);
        }
      }
      
      // 4. Class methods (already working after P0 fixes)
      if (node.type === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          // Walk up: method_definition → class_body → class_declaration
          let className = 'Unknown';
          let parent = node.parent;
          while (parent) {
            if (parent.type === 'class_declaration') {
              const classNameNode = parent.childForFieldName('name');
              if (classNameNode) {
                className = classNameNode.text;
              }
              break;
            }
            parent = parent.parent;
          }

          const functionName = `${className}.${nameNode.text}`;

          this.functions.push({
            name: functionName,
            file: filePath,
            line: nameNode.startPosition.row + 1
          });

          const bodyNode = node.childForFieldName('body');
          this.calculateComplexity(bodyNode || node, functionName, filePath);
        }
      }

      
      // return { method() {} } or someFunc({ handler() {} })
      if (node.type === 'object') {
        // Check if this object is NOT already handled by variable_declarator
        let parent = node.parent;
        let isInVariableDeclarator = false;
        
        while (parent) {
          if (parent.type === 'variable_declarator') {
            isInVariableDeclarator = true;
            break;
          }
          parent = parent.parent;
        }

        // Only extract if it's a standalone object (not assigned to a variable)
        if (!isInVariableDeclarator) {
          // Use context-based naming for anonymous objects
          this.extractObjectMethods(node, 'AnonymousObject', filePath);
        }
      }
  
      // Recurse through children
      for (let i = 0; i < node.childCount; i++) {
        visit(node.child(i)!);
      }
    };
  
    visit(tree.rootNode);
  }

  // Extract methods from object literals
  private extractObjectMethods(objectNode: Parser.SyntaxNode, objectName: string, filePath: string): void {
    for (let i = 0; i < objectNode.childCount; i++) {
      const child = objectNode.child(i);
      if (!child) continue;

      // 1. Method shorthand syntax: { method() {} }
      if (child.type === 'method_definition') {
        const nameNode = child.childForFieldName('name');
        if (nameNode) {
          const functionName = `${objectName}.${nameNode.text}`;
          
          this.functions.push({
            name: functionName,
            file: filePath,
            line: nameNode.startPosition.row + 1
          });

          // Use the method body for complexity
          const bodyNode = child.childForFieldName('body');
          this.calculateComplexity(bodyNode || child, functionName, filePath);
        }
      }

      // 2. Property pairs with function values
      // { method: function() {} } or { method: () => {} }
      if (child.type === 'pair') {
        const keyNode = child.childForFieldName('key');
        const valueNode = child.childForFieldName('value');

        if (keyNode && valueNode && (
          valueNode.type === 'function' ||
          valueNode.type === 'function_expression' ||
          valueNode.type === 'arrow_function'
        )) {
          const functionName = `${objectName}.${keyNode.text}`;
          
          this.functions.push({
            name: functionName,
            file: filePath,
            line: keyNode.startPosition.row + 1
          });

          this.calculateComplexity(valueNode, functionName, filePath);
        }
      }

      // 3. Shorthand property identifier (references, not definitions)
      // { myFunc } - this just references an existing function
      // Skip these as they're not function definitions
      if (child.type === 'shorthand_property_identifier') {
        // Do nothing - we'll catch the actual function definition elsewhere
      }
    }
  }

  // Extract function calls from a single file
  private extractCalls(tree: Parser.Tree, filePath: string): void {
    let currentFunction: string | null = null;
    let currentClass: string | null = null;

    const visit = (node: Parser.SyntaxNode) => {
      // Track current class
      if (node.type === 'class_declaration') {
        const classNameNode = node.childForFieldName('name');
        if (classNameNode) {
          const previousClass = currentClass;
          currentClass = classNameNode.text;

          for (let i = 0; i < node.childCount; i++) {
            visit(node.child(i)!);
          }

          currentClass = previousClass;
          return;
        }
      }

      // Track regular functions
      if (node.type === 'function_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const previousFunction = currentFunction;
          currentFunction = nameNode.text;

          for (let i = 0; i < node.childCount; i++) {
            visit(node.child(i)!);
          }

          currentFunction = previousFunction;
          return;
        }
      }

      // Track arrow functions
      if (node.type === 'variable_declarator') {
        const nameNode = node.childForFieldName('name');
        const valueNode = node.childForFieldName('value');
        
        if (nameNode && valueNode && valueNode.type === 'arrow_function') {
          const previousFunction = currentFunction;
          currentFunction = nameNode.text;

          for (let i = 0; i < valueNode.childCount; i++) {
            visit(valueNode.child(i)!);
          }

          currentFunction = previousFunction;
          return;
        }
      }

      // Track class methods
      if (node.type === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode && currentClass) {
          const previousFunction = currentFunction;
          currentFunction = `${currentClass}.${nameNode.text}`;

          for (let i = 0; i < node.childCount; i++) {
            visit(node.child(i)!);
          }

          currentFunction = previousFunction;
          return;
        }
      }

      // Find regular function calls: someFunction()
      if (node.type === 'call_expression' && currentFunction) {
        const functionNode = node.childForFieldName('function');
        
        if (functionNode && functionNode.type === 'identifier') {
          this.calls.push({
            caller: currentFunction,
            callee: functionNode.text,
            file: filePath,
            line: functionNode.startPosition.row + 1
          });
        }
        
        // Find method calls: this.someMethod() or obj.method()
        if (functionNode && functionNode.type === 'member_expression') {
          const propertyNode = functionNode.childForFieldName('property');
          if (propertyNode) {
            const objectNode = functionNode.childForFieldName('object');
            if (objectNode && objectNode.type === 'this' && currentClass) {
              this.calls.push({
                caller: currentFunction,
                callee: `${currentClass}.${propertyNode.text}`,
                file: filePath,
                line: propertyNode.startPosition.row + 1
              });
            } else {
              this.calls.push({
                caller: currentFunction,
                callee: propertyNode.text,
                file: filePath,
                line: propertyNode.startPosition.row + 1
              });
            }
          }
        }
      }

      // Continue visiting children
      for (let i = 0; i < node.childCount; i++) {
        visit(node.child(i)!);
      }
    };

    visit(tree.rootNode);
  }

  private extractImportsExports(tree: Parser.Tree, filePath: string): void {
    const fileImports: string[] = [];
    const fileExports: string[] = [];
    
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Find ES6 imports: import ... from '...'
    const es6ImportRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6ImportRegex.exec(code)) !== null) {
      const modulePath = match[1];
      if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
        fileImports.push(modulePath);
      }
    }
    
    // Find CommonJS requires: require('...')
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(code)) !== null) {
      const modulePath = match[1];
      if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
        fileImports.push(modulePath);
      }
    }
    
    // Find ES6 exports
    if (code.includes('export ')) {
      const exportFunctionRegex = /export\s+(?:async\s+)?function\s+(\w+)/g;
      while ((match = exportFunctionRegex.exec(code)) !== null) {
        fileExports.push(match[1]);
      }
      
      const exportConstRegex = /export\s+const\s+(\w+)/g;
      while ((match = exportConstRegex.exec(code)) !== null) {
        fileExports.push(match[1]);
      }
      
      if (code.includes('export default')) {
        fileExports.push('default');
      }
    }
    
    // Find CommonJS exports
    if (code.includes('module.exports') || code.includes('exports.')) {
      fileExports.push('commonjs-exports');
    }
    
    if (fileImports.length > 0) {
      this.imports.push({
        file: filePath,
        imports: fileImports,
        line: 1
      });
    }
    
    if (fileExports.length > 0) {
      this.exports.push({
        file: filePath,
        exports: fileExports,
        line: 1
      });
    }
  }

  private analyzeFile(filePath: string): void {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      
      const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
      const parser = isTypeScript ? this.tsParser : this.jsParser;
      
      const tree = parser.parse(code);

      this.extractFunctions(tree, filePath);
      this.extractCalls(tree, filePath);
      this.extractImportsExports(tree, filePath);
    } catch (error) {
      console.error(`Warning: Could not parse ${filePath}`);
    }
  }

  private calculateComplexity(node: Parser.SyntaxNode, functionName: string, filePath: string): void {
    let complexity = 1; // Base complexity
    let lineCount = node.endPosition.row - node.startPosition.row + 1;
    let paramCount = 0;

    // Count parameters
    const paramsNode = node.childForFieldName('parameters');
    if (paramsNode) {
      for (let i = 0; i < paramsNode.childCount; i++) {
        const child = paramsNode.child(i);
        if (child && (
          child.type === 'identifier' ||
          child.type === 'required_parameter' ||   // TypeScript: (x: number)
          child.type === 'optional_parameter' ||   // TypeScript: (x?: number)
          child.type === 'rest_parameter' ||       // TypeScript: (...args)
          child.type === 'assignment_pattern'      // Default: (x = 5)
        )) {
          paramCount++;
        }
      }
    }

    // Count complexity-adding constructs
    const visit = (currentNode: Parser.SyntaxNode) => {
     
      if (
        currentNode.type === 'if_statement' ||
        currentNode.type === 'for_statement' ||
        currentNode.type === 'for_in_statement' ||
        currentNode.type === 'for_of_statement' ||
        currentNode.type === 'while_statement' ||
        currentNode.type === 'do_statement' ||
        currentNode.type === 'case_clause' ||       // JavaScript switch case
        currentNode.type === 'switch_case' ||       // TypeScript switch case
        currentNode.type === 'catch_clause' ||
        currentNode.type === 'conditional_expression' ||  // JavaScript ternary
        currentNode.type === 'ternary_expression'         // TypeScript ternary
      ) {
        complexity++;
      }

      // Logical operators && and ||
      if (
        currentNode.type === 'binary_expression' &&
        (currentNode.text.includes('&&') || currentNode.text.includes('||'))
      ) {
        complexity++;
      }

      // Recurse
      for (let i = 0; i < currentNode.childCount; i++) {
        visit(currentNode.child(i)!);
      }
    };

    visit(node);

    this.complexity.push({
      name: functionName,
      file: filePath,
      line: node.startPosition.row + 1,
      complexity,
      lineCount,
      paramCount
    });
  }

  public analyzeDirectory(directory: string): CallGraph {
    const files = this.findJSFiles(directory);
    this.fileCount = files.length;
    
    files.forEach(file => this.analyzeFile(file));  

    const graph = new CallGraph();

    this.functions.forEach(fn => {
      if (!fn.name) {
        console.warn(`[WARN] Anonymous function ignored → ${fn.file}:${fn.line}`);
        return;
      }
      graph.addNode(fn.name, fn.file, fn.line);
    });

    this.calls.forEach(call => {
      if (!call.caller || !call.callee) {
        console.warn(`[WARN] Unresolved call ignored → ${call.file}:${call.line}`);
        return;
      }
      graph.addEdge(call.caller, call.callee, call.file, call.line);
    });

    this.imports.forEach(importInfo => {
      importInfo.imports.forEach(importPath => {
        graph.addDependency(importInfo.file, importPath);
      });
    });

    this.complexity.forEach(c => {
      graph.addComplexity(c.name, c);
    });

    return graph;
  }

  public getFileCount(): number {
    return this.fileCount;
  }

  public getImports(): ImportInfo[] {
    return this.imports;
  }

  public getExports(): ExportInfo[] {
    return this.exports;
  }

  public getComplexity(): ComplexityInfo[] {
    return this.complexity;
  }
}




