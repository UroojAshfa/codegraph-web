// app/api/ai-analyze/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { functionName, complexity, file, line } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate comprehensive analysis
    const prompt = `You are a senior software engineer reviewing code. Analyze this function:

Function: ${functionName}
File: ${file}:${line}
Cyclomatic Complexity: ${complexity}

Provide a detailed analysis in the following JSON format (respond ONLY with JSON, no markdown):
{
  "explanation": "A clear explanation of what this function does and why it has this complexity level",
  "codeSmells": ["Array of specific code smells detected based on the name and complexity"],
  "refactoringSuggestions": "Specific, actionable suggestions to reduce complexity and improve maintainability"
}

Focus on:
1. What the function likely does based on its name
2. Why complexity of ${complexity} might be problematic
3. Concrete refactoring strategies
4. Code smell patterns typical for functions with this complexity

Be specific and actionable. If complexity is low (1-5), praise the simplicity. If high (>15), provide urgent refactoring advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown formatting if present
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse JSON response
    const insights = JSON.parse(text);

    return NextResponse.json({
      success: true,
      data: insights,
    });

  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "AI analysis failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "AI Analysis API",
    configured: !!process.env.GEMINI_API_KEY,
  });
}