"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface BatchAnalysisResult {
  function: {
    name: string;
    complexity: number;
    file: string;
    line: number;
  };
  insights: {
    explanation?: string;
    codeSmells?: string[];
    refactoringSuggestions?: string;
  };
}

interface AnalyzeAllButtonProps {
  topFunctions: any[];
}

export function AnalyzeAllButton({ topFunctions }: AnalyzeAllButtonProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<BatchAnalysisResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Store results in sessionStorage for persistence
  const analyzeAll = async () => {
    setAnalyzing(true);
    setProgress(0);
    setResults([]);
    setError(null);

    const toAnalyze = topFunctions
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 5);

    const newResults: BatchAnalysisResult[] = [];

    for (let i = 0; i < toAnalyze.length; i++) {
      try {
        const response = await fetch("/api/ai-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            functionName: toAnalyze[i].name,
            complexity: toAnalyze[i].complexity,
            file: toAnalyze[i].file,
            line: toAnalyze[i].line,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          newResults.push({
            function: toAnalyze[i],
            insights: result.data,
          });
          setResults([...newResults]);
          
          // Save to sessionStorage for export features
          sessionStorage.setItem('batchAIResults', JSON.stringify(newResults));
        } else {
          throw new Error(`Failed to analyze ${toAnalyze[i].name}`);
        }
      } catch (err) {
        console.error(`Error analyzing ${toAnalyze[i].name}:`, err);
        setError(`Failed to analyze some functions. Completed ${newResults.length} of ${toAnalyze.length}.`);
      }

      setProgress(((i + 1) / toAnalyze.length) * 100);
    }

    setAnalyzing(false);
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 10) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (complexity <= 20) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="mb-8">
      {/* Action Card */}
      <div className="premium-card p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              
              Batch AI Analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Get AI insights for the 5 most complex functions • Powered by Gemini Pro
            </p>
          </div>
          <button
            onClick={analyzeAll}
            disabled={analyzing || results.length > 0}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
                <span>{Math.round(progress)}%</span>
              </>
            ) : results.length > 0 ? (
              <>
                
                <span>Analysis Complete ✓</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze Top 5</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {analyzing && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
             AI Analysis Results ({results.length} functions)
          </h4>
          
          {results.map((result, index) => (
            <div
              key={index}
              className="premium-card overflow-hidden border-l-4"
              style={{
                borderLeftColor: 
                  result.function.complexity <= 10 ? '#10b981' :
                  result.function.complexity <= 20 ? '#f59e0b' : '#ef4444'
              }}
            >
              {/* Header - Always Visible */}
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-medium text-slate-900 dark:text-white block truncate">
                      {result.function.name}
                    </code>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {result.function.file.split(/[\\/]/).pop()}:{result.function.line}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getComplexityColor(result.function.complexity)}`}>
                    {result.function.complexity}
                  </span>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedIndex === index && (
                <div className="p-4 pt-0 space-y-4">
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                    
                    {/* Explanation */}
                    {result.insights.explanation && (
                      <div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                           Explanation
                        </h5>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {result.insights.explanation}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Code Smells */}
                    {result.insights.codeSmells && result.insights.codeSmells.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                          <span>⚠️</span> Code Smells Detected
                        </h5>
                        <ul className="space-y-2">
                          {result.insights.codeSmells.map((smell, i) => (
                            <li key={i} className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <div className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">{smell}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Refactoring Suggestions */}
                    {result.insights.refactoringSuggestions && (
                      <div>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                           Refactoring Suggestions
                        </h5>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {result.insights.refactoringSuggestions}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}