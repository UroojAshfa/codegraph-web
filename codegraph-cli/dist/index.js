"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const analyzer_1 = require("./analyzer");
const fs = __importStar(require("fs"));
const directory = process.argv[2] || './test-files';
console.log(' CodeGraph - Codebase Intelligence Tool\n');
const analyzer = new analyzer_1.CodeAnalyzer();
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
