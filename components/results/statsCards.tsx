// components/results/statsCards.tsx
import { FileCode, Boxes, TrendingUp, AlertTriangle, LogIn, LogOut, GitBranch } from "lucide-react";

interface StatsCardsProps {
  data: any;
}

export function StatsCards({ data }: StatsCardsProps) {
  const highComplexityCount = data.complexity?.filter((c: any) => c.complexity > 15).length || 0;
  const circularDepsCount = data.circularDependencies?.length || 0;

  const stats = [
    {
      label: "Files Analyzed",
      value: data.fileCount || 0,
      icon: FileCode,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
    },
    {
      label: "Functions Found",
      value: data.functionCount || 0,
      icon: Boxes,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      label: "Avg Complexity",
      value: data.avgComplexity?.toFixed(1) || "0.0",
      icon: TrendingUp,
      color: data.avgComplexity <= 5 
        ? "text-green-600 dark:text-green-400"
        : data.avgComplexity <= 10
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400",
      bgColor: data.avgComplexity <= 5
        ? "bg-green-100 dark:bg-green-900/20"
        : data.avgComplexity <= 10
        ? "bg-amber-100 dark:bg-amber-900/20"
        : "bg-red-100 dark:bg-red-900/20",
      subtitle: data.avgComplexity <= 5 ? "Excellent" : data.avgComplexity <= 10 ? "Good" : "High",
    },
    {
      label: "Max Complexity",
      value: data.maxComplexity || 0,
      icon: AlertTriangle,
      color: data.maxComplexity <= 10
        ? "text-green-600 dark:text-green-400"
        : data.maxComplexity <= 20
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400",
      bgColor: data.maxComplexity <= 10
        ? "bg-green-100 dark:bg-green-900/20"
        : data.maxComplexity <= 20
        ? "bg-amber-100 dark:bg-amber-900/20"
        : "bg-red-100 dark:bg-red-900/20",
      subtitle: data.maxComplexity <= 10 ? "Clean" : data.maxComplexity <= 20 ? "Moderate" : "Critical",
    },
    {
      label: "Entry Points",
      value: data.entryPoints || 0,
      icon: LogIn,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      subtitle: "Not called by others",
      tooltip: "Functions that are never called by other functions (potential API entry points)",
    },
    {
      label: "Leaf Functions",
      value: data.leafFunctions || 0,
      icon: LogOut,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      subtitle: "Don't call others",
      tooltip: "Functions that don't call any other functions (utilities or endpoints)",
    },
  ];

  // Add circular dependencies card only if there are any, or show success
  if (circularDepsCount > 0) {
    stats.push({
      label: "Circular Dependencies",
      value: circularDepsCount,
      icon: GitBranch,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      subtitle: "⚠️ Needs attention",
      tooltip: "Files that import each other in a cycle",
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="stat-card group"
          style={{ animationDelay: `${index * 50}ms` }}
          title={stat.tooltip}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>

          <div className="mb-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </div>
            {stat.subtitle && (
              <div className={`text-sm font-medium mt-1 ${stat.color}`}>
                {stat.subtitle}
              </div>
            )}
          </div>

          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {stat.label}
          </div>
        </div>
      ))}

      {/* Success Card for No Circular Dependencies */}
      {circularDepsCount === 0 && (
        <div
          className="stat-card group"
          style={{ animationDelay: `${stats.length * 50}ms` }}
          title="No circular dependencies detected - clean architecture!"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20 group-hover:scale-110 transition-transform">
              <GitBranch className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="mb-2">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              0
            </div>
            <div className="text-sm font-medium mt-1 text-green-600 dark:text-green-400">
              ✅ Clean architecture
            </div>
          </div>

          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Circular Dependencies
          </div>
        </div>
      )}
    </div>
  );
}