// components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Moon, Sun, Github } from "lucide-react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-electric rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              CodeGraph
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cg-electric transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#examples"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cg-electric transition-colors"
            >
              Examples
            </Link>
            <a
              href="https://github.com/UroojAshfa/codegraph-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cg-electric transition-colors"
            >
              Docs
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cg-electric transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/UroojAshfa/codegraph-web"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-400 dark:hover:border-cyan-400 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}