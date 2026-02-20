// components/upload/FileUploadZone.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, X, AlertCircle } from "lucide-react";

export function FileUploadZone() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    const validExtensions = [".js", ".ts", ".jsx", ".tsx"];
    const maxFileSize = 10 * 1024 * 1024; // 10MB per file
    const maxTotalSize = 50 * 1024 * 1024; // 50MB total

    let totalSize = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const extension = file.name.substring(file.name.lastIndexOf("."));

      if (!validExtensions.includes(extension)) {
        setError(`Invalid file type: ${file.name}. Only .js, .ts, .jsx, .tsx allowed.`);
        continue;
      }

      if (file.size > maxFileSize) {
        setError(`File too large: ${file.name}. Max 10MB per file.`);
        continue;
      }

      totalSize += file.size;
      if (totalSize > maxTotalSize) {
        setError("Total file size exceeds 50MB limit.");
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 100) {
      setError("Maximum 100 files allowed.");
      return validFiles.slice(0, 100);
    }

    return validFiles;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");

    const droppedFiles = e.dataTransfer.files;
    const validFiles = validateFiles(droppedFiles);
    
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFiles = e.target.files;
    
    if (selectedFiles) {
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Please upload at least one file.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const result = await response.json();
      
      // Store result in sessionStorage and navigate
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const formattedSize = (totalSize / 1024 / 1024).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl transition-all duration-200
          ${isDragging
            ? "border-cyan-400 bg-cyan-400/5 scale-[1.02] electric-glow"
            : "border-slate-300 dark:border-slate-700 hover:border-cyan-400/50 dark:hover:border-cyan-400/50"
          }
          ${files.length > 0 ? "bg-white dark:bg-cg-charcoal-light" : "bg-slate-50 dark:bg-cg-charcoal-light/50"}
        `}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".js,.ts,.jsx,.tsx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer"
        >
          <div className={`
            p-4 rounded-full mb-4 transition-all duration-200
            ${isDragging 
              ? "bg-cg-electric text-white scale-110" 
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }
          `}>
            <Upload className="w-8 h-8" />
          </div>
          
          <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {isDragging ? "Drop files here" : "Drop your code files here"}
          </p>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            or click to browse
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-500 dark:text-slate-500">
            <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              .js
            </span>
            <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              .ts
            </span>
            <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              .jsx
            </span>
            <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              .tsx
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
            Max 100 files • 10MB per file • 50MB total
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="premium-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Uploaded Files ({files.length})
            </h3>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {formattedSize} MB
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-hide">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-4 h-4 text-cg-electric flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500 flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full btn-electric disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analyze {files.length} {files.length === 1 ? "File" : "Files"}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}