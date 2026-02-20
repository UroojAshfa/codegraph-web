// lib/colors.ts
// Color utilities for CodeGraph - Charcoal + Electric Cyan theme

/**
 * Complexity levels and their thresholds
 */
export const COMPLEXITY_LEVELS = {
    PRISTINE: { min: 1, max: 5, label: "Pristine" },
    CLEAN: { min: 6, max: 10, label: "Clean" },
    MODERATE: { min: 11, max: 15, label: "Moderate" },
    COMPLEX: { min: 16, max: 20, label: "Complex" },
    CRITICAL: { min: 21, max: Infinity, label: "Critical" },
  } as const;
  
  export type ComplexityLevel = keyof typeof COMPLEXITY_LEVELS;
  
  /**
   * Get complexity level from a complexity score
   */
  export function getComplexityLevel(complexity: number): ComplexityLevel {
    if (complexity <= 5) return "PRISTINE";
    if (complexity <= 10) return "CLEAN";
    if (complexity <= 15) return "MODERATE";
    if (complexity <= 20) return "COMPLEX";
    return "CRITICAL";
  }
  
  /**
   * Get Tailwind color class for complexity level
   */
  export function getComplexityColor(complexity: number): string {
    const level = getComplexityLevel(complexity);
    
    const colors: Record<ComplexityLevel, string> = {
      PRISTINE: "text-cyan-600 dark:text-cyan-400",
      CLEAN: "text-emerald-600 dark:text-emerald-400",
      MODERATE: "text-amber-600 dark:text-amber-400",
      COMPLEX: "text-orange-600 dark:text-orange-400",
      CRITICAL: "text-red-600 dark:text-red-400",
    };
    
    return colors[level];
  }
  
  /**
   * Get background color class for complexity badges
   */
  export function getComplexityBadgeClass(complexity: number): string {
    const level = getComplexityLevel(complexity);
    
    const classes: Record<ComplexityLevel, string> = {
      PRISTINE: "complexity-pristine",
      CLEAN: "complexity-clean",
      MODERATE: "complexity-moderate",
      COMPLEX: "complexity-complex",
      CRITICAL: "complexity-critical",
    };
    
    return classes[level];
  }
  
  /**
   * Get hex color for complexity (for charts)
   */
  export function getComplexityHex(complexity: number): string {
    const level = getComplexityLevel(complexity);
    
    const colors: Record<ComplexityLevel, string> = {
      PRISTINE: "#06b6d4",  // Cyan
      CLEAN: "#10b981",     // Emerald
      MODERATE: "#f59e0b",  // Amber
      COMPLEX: "#f97316",   // Orange
      CRITICAL: "#ef4444",  // Red
    };
    
    return colors[level];
  }
  
  /**
   * Get complexity description
   */
  export function getComplexityDescription(complexity: number): string {
    const level = getComplexityLevel(complexity);
    
    const descriptions: Record<ComplexityLevel, string> = {
      PRISTINE: "Clean and simple - easy to understand",
      CLEAN: "Good complexity - well structured",
      MODERATE: "Moderate complexity - could be simplified",
      COMPLEX: "High complexity - consider refactoring",
      CRITICAL: "Critical complexity - needs immediate attention",
    };
    
    return descriptions[level];
  }
  
  /**
   * Get emoji for complexity level
   */
  export function getComplexityEmoji(complexity: number): string {
    const level = getComplexityLevel(complexity);
    
    const emojis: Record<ComplexityLevel, string> = {
      PRISTINE: "✨",
      CLEAN: "✅",
      MODERATE: "⚠️",
      COMPLEX: "🔴",
      CRITICAL: "💥",
    };
    
    return emojis[level];
  }
  
  /**
   * Calculate color for a range (used in charts)
   */
  export function interpolateComplexityColor(
    complexity: number,
    minComplexity: number,
    maxComplexity: number
  ): string {
    const normalized = Math.min(
      Math.max((complexity - minComplexity) / (maxComplexity - minComplexity), 0),
      1
    );
    
    // Interpolate from cyan to red
    if (normalized < 0.25) return "#06b6d4"; // Cyan
    if (normalized < 0.5) return "#10b981";  // Emerald
    if (normalized < 0.75) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  }
  
  /**
   * Get gradient class for complexity (used in visualizations)
   */
  export function getComplexityGradient(complexity: number): string {
    const level = getComplexityLevel(complexity);
    
    const gradients: Record<ComplexityLevel, string> = {
      PRISTINE: "from-cyan-500 to-cyan-600",
      CLEAN: "from-emerald-500 to-emerald-600",
      MODERATE: "from-amber-500 to-amber-600",
      COMPLEX: "from-orange-500 to-orange-600",
      CRITICAL: "from-red-500 to-red-600",
    };
    
    return gradients[level];
  }
  
  /**
   * Theme colors
   */
  export const THEME_COLORS = {
    // Brand
    charcoal: "#0f172a",
    charcoalLight: "#1e293b",
    electric: "#06b6d4",
    electricBright: "#22d3ee",
    electricDim: "#0891b2",
    
    // Complexity spectrum
    pristine: "#06b6d4",
    clean: "#10b981",
    moderate: "#f59e0b",
    complex: "#f97316",
    critical: "#ef4444",
    
    // Neutrals
    white: "#ffffff",
    offWhite: "#f8fafc",
    border: "#e2e8f0",
    text: "#0f172a",
    textSecondary: "#64748b",
  } as const;
  
  /**
   * Chart.js color configuration
   */
  export const CHART_COLORS = {
    backgroundColor: [
      "rgba(6, 182, 212, 0.8)",   // Cyan
      "rgba(16, 185, 129, 0.8)",  // Emerald
      "rgba(245, 158, 11, 0.8)",  // Amber
      "rgba(249, 115, 22, 0.8)",  // Orange
      "rgba(239, 68, 68, 0.8)",   // Red
    ],
    borderColor: [
      "#06b6d4", // Cyan
      "#10b981", // Emerald
      "#f59e0b", // Amber
      "#f97316", // Orange
      "#ef4444", // Red
    ],
    hoverBackgroundColor: [
      "rgba(6, 182, 212, 1)",
      "rgba(16, 185, 129, 1)",
      "rgba(245, 158, 11, 1)",
      "rgba(249, 115, 22, 1)",
      "rgba(239, 68, 68, 1)",
    ],
  };
  
  /**
   * Get opacity variant of a hex color
   */
  export function hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  /**
   * Check if dark mode is active
   */
  export function isDarkMode(): boolean {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  }
  
  /**
   * Get theme-aware color
   */
  export function getThemedColor(lightColor: string, darkColor: string): string {
    return isDarkMode() ? darkColor : lightColor;
  }