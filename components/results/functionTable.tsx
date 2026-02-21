"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { AIInsightsModal } from "./aiInsightsModal";

interface FunctionTableProps {
  data: any;
}

type SortField = "name" | "complexity" | "file";
type SortDirection = "asc" | "desc";

function getComplexityBadge(complexity: number) {
  if (complexity <= 5)  return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
  if (complexity <= 10) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (complexity <= 15) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (complexity <= 20) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}



export function FunctionTable({ data }: FunctionTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("complexity");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [selectedFunction, setSelectedFunction] = useState<any | null>(null);

  const functions = data.complexity || [];

  const filtered = useMemo(() => {
    let result = functions;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (fn: any) =>
          fn.name?.toLowerCase().includes(q) ||
          fn.file?.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a: any, b: any) => {
      let cmp = 0;
      if (sortField === "name") cmp = (a.name || "").localeCompare(b.name || "");
      if (sortField === "complexity") cmp = a.complexity - b.complexity;
      if (sortField === "file") cmp = (a.file || "").localeCompare(b.file || "");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [functions, search, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-30" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-4 h-4 text-cyan-500" />
      : <ArrowDown className="w-4 h-4 text-cyan-500" />;
  };

  return (
    <>
      <div className="premium-card p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                All Functions
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {filtered.length} of {functions.length} functions
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by function name or file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-700">
              <tr>
                {(["name", "complexity", "file"] as SortField[]).map((field) => (
                  <th key={field} className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort(field)}
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors capitalize"
                    >
                      {field}
                      <SortIcon field={field} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Line
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                  AI Analysis
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No functions found matching &quot;{search}&quot;
                  </td>
                </tr>
              ) : (
                filtered.map((fn: any, i: number) => (
                  <tr
                    key={`${fn.file}-${fn.name}-${i}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <code className="text-sm font-medium text-slate-900 dark:text-white">
                        {fn.name}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getComplexityBadge(fn.complexity)}`}>
                         {fn.complexity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                        {fn.file?.split(/[\\/]/).pop()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {fn.line}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedFunction(fn)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/40 rounded-lg transition-colors"
                        title="Get AI-powered insights"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span className="hidden sm:inline">AI Insights</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Modal */}
      {selectedFunction && (
        <AIInsightsModal
          functionData={selectedFunction}
          onClose={() => setSelectedFunction(null)}
        />
      )}
    </>
  );
}