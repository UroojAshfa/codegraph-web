// src/index.ts
import { CodeAnalyzer } from './analyzer';
import * as fs from 'fs';

const directory = process.argv[2] || './test-files';

console.log(' CodeGraph - Codebase Intelligence Tool\n');

const analyzer = new CodeAnalyzer();
const graph = analyzer.analyzeDirectory(directory);

console.log('='.repeat(60));
graph.printStats();
console.log('='.repeat(60) + '\n');

// Save graph as JSON
const jsonOutput = graph.toJSON();
fs.writeFileSync('output.json', JSON.stringify(jsonOutput, null, 2));
console.log('💾 Saved full graph to output.json');

// Generate Mermaid diagram
const mermaidDiagram = graph.toMermaid();
const mermaidFile = '```mermaid\n' + mermaidDiagram + '```\n\nView at: https://mermaid.live';
fs.writeFileSync('diagram.md', mermaidFile);
console.log('📊 Saved visualization to diagram.md');

console.log('\n✨ Analysis complete!\n');