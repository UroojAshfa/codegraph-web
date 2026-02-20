// components/landing/ExampleProjects.tsx
"use client";

import { Code2, Server, Boxes } from "lucide-react";

export function ExampleProjects() {
  const examples = [
    {
      id: "react-component",
      icon: Code2,
      title: "React Component",
      description: "Analyze a real React component with hooks and state management",
      fileCount: 1,
      complexity: "Medium",
    },
    {
      id: "express-api",
      icon: Server,
      title: "Express API",
      description: "REST API with multiple routes and middleware functions",
      fileCount: 3,
      complexity: "High",
    },
    {
      id: "codegraph-parser",
      icon: Boxes,
      title: "CodeGraph Parser",
      description: "Meta! Analyze the CodeGraph analyzer itself",
      fileCount: 5,
      complexity: "Very High",
    },
  ];

  const handleExampleClick = (exampleId: string) => {
    
    console.log("Loading example:", exampleId);
    alert("Example projects coming soon! For now, try uploading your own files.");
  };

  return (
    <div id="examples" className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Try an Example
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          See CodeGraph in action with pre-loaded code samples
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => handleExampleClick(example.id)}
            className="premium-card p-6 text-left hover:border-ccyan-400/50 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-cyan-400 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <example.icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {example.title}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {example.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
              <span>{example.fileCount} {example.fileCount === 1 ? 'file' : 'files'}</span>
              <span>•</span>
              <span className={`
                ${example.complexity === 'Medium' && 'text-amber-600 dark:text-amber-400'}
                ${example.complexity === 'High' && 'text-orange-600 dark:text-orange-400'}
                ${example.complexity === 'Very High' && 'text-red-600 dark:text-red-400'}
              `}>
                {example.complexity} complexity
              </span>
            </div>

            <div className="mt-4 text-sm text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
              <span>Click to analyze</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}