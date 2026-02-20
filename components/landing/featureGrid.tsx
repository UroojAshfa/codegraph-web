// components/landing/FeatureGrid.tsx
import { BarChart3, GitBranch, Sparkles, Zap } from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: BarChart3,
      title: "Complexity Analysis",
      description: "McCabe cyclomatic complexity with detailed breakdowns for every function",
    },
    {
      icon: GitBranch,
      title: "Call Graph Visualization",
      description: "Interactive diagrams showing how your functions connect and interact",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Smart refactoring suggestions and automatic code smell detection",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Fast analysis with beautiful, shareable HTML reports",
    },
  ];

  return (
    <div id="features" className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Everything You Need
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Professional-grade code analysis tools, powered by AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="premium-card p-6 text-center group hover:border-cyan-400/30 transition-all"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-12 h-12 bg-cg-electric/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-cg-electric/20 group-hover:scale-110 transition-all">
              <feature.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}