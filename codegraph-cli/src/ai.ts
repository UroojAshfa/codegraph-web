// src/ai.ts
import { GoogleGenerativeAI, GenerativeModel, } from '@google/generative-ai';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  async explainFunction(
    functionName: string,
    functionCode: string,
    complexity: number,
    callers: string[],
    callees: string[]
  ): Promise<string> {
    const prompt = `You are a senior software engineer doing code review.

Analyze this function:

Function name: ${functionName}
Complexity: ${complexity}
Called by: ${callers.length > 0 ? callers.join(', ') : 'nothing (entry point)'}
Calls: ${callees.length > 0 ? callees.join(', ') : 'nothing (leaf function)'}

Code:
\`\`\`javascript
${functionCode}
\`\`\`

Provide a concise analysis in this format:

**Purpose:** (1 sentence - what does this function do?)

**Role:** (1 sentence - where does it fit in the architecture?)

**Complexity Analysis:** (1 sentence - is ${complexity} concerning? why?)

**Recommendations:** (2-3 bullet points - concrete improvements)

Keep it brief and actionable. Focus on what matters.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`AI analysis failed: ${error}`);
    }
  }

  async analyzeComplexity(
    functionName: string,
    complexity: number,
    lineCount: number
  ): Promise<string> {
    const prompt = `You are a code quality expert.

Function: ${functionName}
Complexity: ${complexity}
Lines: ${lineCount}

Industry thresholds:
- Complexity >10 = high risk (2x more bugs)
- Lines >50 = hard to maintain

Is this function a refactoring candidate? Why or why not?

Respond in 2-3 sentences. Be direct and actionable.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`AI analysis failed: ${error}`);
    }
  }

  async suggestRefactoring(
    functionName: string,
    functionCode: string,
    complexity: number
  ): Promise<string> {
    if (complexity < 8) {
      return "This function has acceptable complexity. No refactoring needed.";
    }

    const prompt = `You are an expert at code refactoring.

This function has high complexity (${complexity}):

\`\`\`javascript
${functionCode}
\`\`\`

Suggest how to refactor this into smaller, focused functions.

Format:
**Split into:**
1. function_name_1() - what it does
2. function_name_2() - what it does
3. function_name_3() - what it does

**Benefits:**
- benefit 1
- benefit 2

Keep it practical and specific to this code.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`AI analysis failed: ${error}`);
    }
  }

  async detectCodeSmells(
    functionCode: string,
    complexity: number,
    lineCount: number,
    paramCount: number
  ): Promise<string[]> {
    const smells: string[] = [];

    // Rule-based detection first
    if (complexity > 10) {
      smells.push(`High complexity (${complexity}) - too many decision points`);
    }
    if (lineCount > 50) {
      smells.push(`Long function (${lineCount} lines) - hard to understand`);
    }
    if (paramCount > 4) {
      smells.push(`Too many parameters (${paramCount}) - consider object parameter`);
    }

    // Then ask AI for deeper analysis
    if (smells.length === 0) {
      return ['No obvious code smells detected ✅'];
    }

    const prompt = `Code smells detected:
${smells.map(s => `- ${s}`).join('\n')}

In 1-2 sentences, explain the impact and priority of fixing these.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      smells.push(`\n💡 ${response.text()}`);
    } catch (error) {
      // If AI fails, just return the rule-based smells
    }

    return smells;
  }
}