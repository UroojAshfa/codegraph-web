// debug-ast.ts - Inspect what node types tree-sitter actually creates
import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';

const parser = new Parser();
parser.setLanguage(TypeScript.typescript);

// Test code with class
const code = `
class MyClass {
  regularMethod() {
    console.log('regular');
  }

  async asyncMethod() {
    await Promise.resolve();
  }

  static staticMethod() {
    return 'static';
  }

  get myGetter() {
    return 'getter';
  }

  set mySetter(value: string) {
    console.log(value);
  }

  private privateMethod() {
    return 'private';
  }
}
`;

const tree = parser.parse(code);

/**
 * Extract all field-name → child-node mappings for a SyntaxNode
 */
function getFieldMap(node: Parser.SyntaxNode): Record<string, Parser.SyntaxNode> {
  const fields: Record<string, Parser.SyntaxNode> = {};

  for (let i = 0; i < node.childCount; i++) {
    const fieldName = node.fieldNameForChild(i);
    const child = node.child(i);

    if (fieldName && child) {
      fields[fieldName] = child;
    }
  }

  return fields;
}

/**
 * Recursively print the entire AST with field labels
 */
function printNodes(node: Parser.SyntaxNode, depth: number = 0) {
  const indent = '  '.repeat(depth);
  const text =
    node.text.length > 50
      ? '(...)'
      : `"${node.text.replace(/\n/g, '\\n')}"`;

  console.log(`${indent}${node.type} ${text}`);

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!child) continue;

    const fieldName = node.fieldNameForChild(i);
    if (fieldName) {
      console.log(`${indent}  ↳ field: ${fieldName}`);
    }

    printNodes(child, depth + 1);
  }
}

/**
 * Find and inspect method / function related nodes
 */
function findMethodNodes(node: Parser.SyntaxNode) {
  if (
    node.type.includes('method') ||
    node.type.includes('function') ||
    node.type.includes('declaration')
  ) {
    console.log(`Found: ${node.type}`);
    console.log(
      `Text: ${node.text.substring(0, 100).replace(/\n/g, ' ')}`
    );

    const fields = getFieldMap(node);
    const fieldNames = Object.keys(fields);

    if (fieldNames.length > 0) {
      console.log('Fields:');
      for (const name of fieldNames) {
        console.log(`  ${name}: ${fields[name].type}`);
      }
    } else {
      console.log('Fields: none');
    }

    console.log('');
  }

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child) {
      findMethodNodes(child);
    }
  }
}

// Run inspectors
console.log('=== AST Structure for TypeScript Class ===\n');
printNodes(tree.rootNode);

console.log('\n=== Looking for method-related nodes ===\n');
findMethodNodes(tree.rootNode);
