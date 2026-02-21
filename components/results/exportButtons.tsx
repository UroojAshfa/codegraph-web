"use client";

import { useState } from "react";
import { Download, FileJson, FileText, Check, FileType } from "lucide-react";

interface ExportButtonsProps {
  data: any;
}

export function ExportButtons({ data }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const downloadJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codegraph-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    const md = generateMarkdown(data);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codegraph-report-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    setExporting(true);
    
    try {
      // Dynamic import to keep bundle size smaller
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with page break
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        
        yPosition += 5;
      };

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('CodeGraph Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Summary
      addText('Summary', 16, true);
      addText(`Files: ${data.fileCount}`);
      addText(`Functions: ${data.functionCount}`);
      addText(`Avg Complexity: ${data.avgComplexity}`);
      addText(`Max Complexity: ${data.maxComplexity}`);
      addText(`Entry Points: ${data.entryPoints || 0}`);
      addText(`Leaf Functions: ${data.leafFunctions || 0}`);
      yPosition += 10;

      // Top Complex Functions
      addText('Top Complex Functions', 16, true);
      data.topComplex?.slice(0, 10).forEach((fn: any, index: number) => {
        const fileName = fn.file?.split(/[\\/]/).pop();
        addText(`${index + 1}. ${fn.name} (Complexity: ${fn.complexity}) - ${fileName}:${fn.line}`);
      });
      yPosition += 10;

      // AI Insights
      const batchResults = sessionStorage.getItem('batchAIResults');
      if (batchResults) {
        try {
          const aiResults = JSON.parse(batchResults);
          if (aiResults && aiResults.length > 0) {
            addText('AI-Powered Insights', 16, true);
            addText('Powered by Google Gemini Pro', 8);
            yPosition += 5;
            
            aiResults.forEach((result: any, index: number) => {
              addText(`${index + 1}. ${result.function.name} (Complexity: ${result.function.complexity})`, 12, true);
              
              if (result.insights.explanation) {
                addText('Explanation:', 10, true);
                addText(result.insights.explanation, 9);
              }
              
              if (result.insights.codeSmells && result.insights.codeSmells.length > 0) {
                addText('Code Smells:', 10, true);
                result.insights.codeSmells.forEach((smell: string) => {
                  addText(`• ${smell}`, 9);
                });
              }
              
              if (result.insights.refactoringSuggestions) {
                addText('Refactoring Suggestions:', 10, true);
                addText(result.insights.refactoringSuggestions, 9);
              }
              
              yPosition += 5;
            });
          }
        } catch (e) {
          console.error('Failed to add AI insights to PDF', e);
        }
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${totalPages} • Generated by CodeGraph`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save
      doc.save(`codegraph-report-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try Markdown export instead.');
    } finally {
      setExporting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={downloadJSON}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition-colors"
        title="Export as JSON"
      >
        <FileJson className="w-4 h-4" />
        <span className="hidden sm:inline">JSON</span>
      </button>

      <button
        onClick={downloadMarkdown}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition-colors"
        title="Export as Markdown (includes AI insights)"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Markdown</span>
      </button>

      <button
        onClick={downloadPDF}
        disabled={exporting}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export as PDF (includes AI insights)"
      >
        <FileType className="w-4 h-4" />
        <span className="hidden sm:inline">{exporting ? 'Generating...' : 'PDF'}</span>
      </button>

      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-colors"
        title="Copy shareable link"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>
    </div>
  );
}

function generateMarkdown(data: any): string {
  let md = `# CodeGraph Analysis Report\n\n`;
  md += `**Generated:** ${new Date().toLocaleString()}\n\n---\n\n`;
  md += `## Summary\n\n`;
  md += `- **Files:** ${data.fileCount}\n`;
  md += `- **Functions:** ${data.functionCount}\n`;
  md += `- **Avg Complexity:** ${data.avgComplexity}\n`;
  md += `- **Max Complexity:** ${data.maxComplexity}\n`;
  md += `- **Entry Points:** ${data.entryPoints || 0}\n`;
  md += `- **Leaf Functions:** ${data.leafFunctions || 0}\n\n`;

  md += `## Complexity Distribution\n\n`;
  md += `| Range | Count | % |\n|-------|-------|---|\n`;
  data.distribution?.forEach((d: any) => {
    md += `| ${d.range} | ${d.count} | ${d.percentage}% |\n`;
  });

  md += `\n## Top Complex Functions\n\n`;
  md += `| Function | Complexity | File |\n|----------|------------|------|\n`;
  data.topComplex?.slice(0, 10).forEach((fn: any) => {
    const file = fn.file?.split(/[\\/]/).pop();
    md += `| \`${fn.name}\` | ${fn.complexity} | ${file}:${fn.line} |\n`;
  });

  // Add AI Insights if available
  const batchResults = sessionStorage.getItem('batchAIResults');
  if (batchResults) {
    try {
      const aiResults = JSON.parse(batchResults);
      if (aiResults && aiResults.length > 0) {
        md += `\n---\n\n##  AI-Powered Insights\n\n`;
        md += `*Powered by Google Gemini Pro*\n\n`;
        
        aiResults.forEach((result: any, index: number) => {
          md += `### ${index + 1}. \`${result.function.name}\` (Complexity: ${result.function.complexity})\n\n`;
          md += `**File:** ${result.function.file}:${result.function.line}\n\n`;
          
          if (result.insights.explanation) {
            md += `####  Explanation\n\n${result.insights.explanation}\n\n`;
          }
          
          if (result.insights.codeSmells && result.insights.codeSmells.length > 0) {
            md += `#### ⚠️ Code Smells Detected\n\n`;
            result.insights.codeSmells.forEach((smell: string) => {
              md += `- ${smell}\n`;
            });
            md += `\n`;
          }
          
          if (result.insights.refactoringSuggestions) {
            md += `####  Refactoring Suggestions\n\n${result.insights.refactoringSuggestions}\n\n`;
          }
          
          md += `---\n\n`;
        });
      }
    } catch (e) {
      console.error('Failed to parse AI results for export', e);
    }
  }

  md += `\n*Generated by [CodeGraph](https://github.com/UroojAshfa/codegraph-web)*\n`;
  return md;
}