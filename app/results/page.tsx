"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatsCards } from "@/components/results/statsCards";
import { ComplexityChart } from "@/components/results/complexityChart";
import { FunctionTable } from "@/components/results/functionTable";
import { ExportButtons } from "@/components/results/exportButtons";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { AnalyzeAllButton } from "@/components/results/analyzeAllButton";

export default function ResultsPage() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem("analysisResult");

    if (!storedData) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      setAnalysisData(parsed.data || parsed);
      setLoading(false);
    } catch (error) {
      console.error("Failed to parse analysis data:", error);
      router.push("/");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">

        {/* Back + Export Row */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Upload</span>
          </Link>
          <ExportButtons data={analysisData} />
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Analysis Results
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Analyzed{" "}
            <span className="text-cyan-500 font-semibold">
              {analysisData.fileCount}
            </span>{" "}
            {analysisData.fileCount === 1 ? "file" : "files"} • Found{" "}
            <span className="text-cyan-500 font-semibold">
              {analysisData.functionCount}
            </span>{" "}
            {analysisData.functionCount === 1 ? "function" : "functions"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards data={analysisData} />
        </div>

        {/* Chart */}
        <div className="mb-8">
          <ComplexityChart data={analysisData} />
        </div>

        <div className="mb-8">
        <AnalyzeAllButton topFunctions={analysisData.complexity || []} />
        </div>

        {/* Function Table */}
        <div className="mb-8">
          <FunctionTable data={analysisData} />
        </div>

        {/* Recommendations */}
        <div className="premium-card p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            💡 Recommendations
          </h2>
          <div className="space-y-3">
            {analysisData.topComplex?.filter((f: any) => f.complexity > 10).length > 0 ? (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-300 mb-1">
                    High Complexity Detected
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {analysisData.topComplex.filter((f: any) => f.complexity > 10).length} function(s) have high complexity.
                    Consider breaking them into smaller functions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-300 mb-1">
                    Looking Good!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    No high complexity functions detected. Keep it up!
                  </p>
                </div>
              </div>
            )}

            {analysisData.circularDependencies?.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <span className="text-xl">🔄</span>
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Circular Dependencies Found
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {analysisData.circularDependencies.length} circular dependency chain(s) detected.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}