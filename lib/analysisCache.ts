// lib/analysisCache.ts
// Tracks which functions have been analyzed to avoid duplicate AI calls

interface CacheEntry {
    functionName: string;
    file: string;
    line: number;
    complexity: number;
    insights: {
      explanation?: string;
      codeSmells?: string[];
      refactoringSuggestions?: string;
    };
    timestamp: number;
  }
  
  export class AnalysisCache {
    private static STORAGE_KEY = 'codegraph_analysis_cache';
    private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
    /**
     * Generate unique key for a function
     */
    private static generateKey(functionName: string, file: string, line: number): string {
      return `${file}:${line}:${functionName}`;
    }
  
    /**
     * Get cached analysis for a function
     */
    static get(functionName: string, file: string, line: number): CacheEntry | null {
      try {
        const cache = this.getCache();
        const key = this.generateKey(functionName, file, line);
        const entry = cache[key];
  
        if (!entry) {
          return null;
        }
  
        // Check if cache is expired
        const age = Date.now() - entry.timestamp;
        if (age > this.CACHE_DURATION) {
          this.remove(functionName, file, line);
          return null;
        }
  
        return entry;
      } catch (e) {
        console.error('Failed to read from cache:', e);
        return null;
      }
    }
  
    /**
     * Save analysis result to cache
     */
    static set(
      functionName: string,
      file: string,
      line: number,
      complexity: number,
      insights: any
    ): void {
      try {
        const cache = this.getCache();
        const key = this.generateKey(functionName, file, line);
  
        cache[key] = {
          functionName,
          file,
          line,
          complexity,
          insights,
          timestamp: Date.now(),
        };
  
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
      } catch (e) {
        console.error('Failed to write to cache:', e);
      }
    }
  
    /**
     * Remove a specific entry from cache
     */
    static remove(functionName: string, file: string, line: number): void {
      try {
        const cache = this.getCache();
        const key = this.generateKey(functionName, file, line);
        delete cache[key];
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
      } catch (e) {
        console.error('Failed to remove from cache:', e);
      }
    }
  
    /**
     * Clear entire cache
     */
    static clear(): void {
      try {
        sessionStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear cache:', e);
      }
    }
  
    /**
     * Get all cached entries
     */
    static getAll(): Record<string, CacheEntry> {
      return this.getCache();
    }
  
    /**
     * Get cache statistics
     */
    static getStats(): {
      totalEntries: number;
      oldestEntry: number | null;
      newestEntry: number | null;
    } {
      const cache = this.getCache();
      const entries = Object.values(cache);
  
      if (entries.length === 0) {
        return {
          totalEntries: 0,
          oldestEntry: null,
          newestEntry: null,
        };
      }
  
      const timestamps = entries.map(e => e.timestamp);
  
      return {
        totalEntries: entries.length,
        oldestEntry: Math.min(...timestamps),
        newestEntry: Math.max(...timestamps),
      };
    }
  
    /**
     * Get the entire cache object
     */
    private static getCache(): Record<string, CacheEntry> {
      try {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        console.error('Failed to parse cache:', e);
        return {};
      }
    }
  }