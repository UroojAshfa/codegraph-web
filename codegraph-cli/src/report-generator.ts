// src/report-generator.ts
import { ComplexityInfo } from './analyzer';
import { CallGraph } from './graph';
import * as fs from 'fs';
import * as path from 'path';

export interface ReportData {
  projectName: string;
  timestamp: string;
  fileCount: number;
  functionCount: number;
  avgComplexity: number;
  maxComplexity: number;
  complexityDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  topComplexFunctions: ComplexityInfo[];
  entryPoints: number;
  leafFunctions: number;
  circularDependencies: number;
  mostImportedFiles: Array<{ file: string; count: number }>;
}

export class ReportGenerator {
  
  generateHTMLReport(
    graph: CallGraph,
    complexity: ComplexityInfo[],
    fileCount: number,
    projectName: string
  ): string {
    const data = this.prepareReportData(graph, complexity, fileCount, projectName);
    return this.buildHTML(data);
  }

  private prepareReportData(
    graph: CallGraph,
    complexity: ComplexityInfo[],
    fileCount: number,
    projectName: string
  ): ReportData {
    // Calculate statistics
    const avgComplexity = complexity.length > 0
      ? complexity.reduce((sum, c) => sum + c.complexity, 0) / complexity.length
      : 0;

    const maxComplexity = complexity.length > 0
      ? Math.max(...complexity.map(c => c.complexity))
      : 0;

    // Complexity distribution
    const distribution = [
      { range: '1-5', count: 0, percentage: 0 },
      { range: '6-10', count: 0, percentage: 0 },
      { range: '11-15', count: 0, percentage: 0 },
      { range: '16-20', count: 0, percentage: 0 },
      { range: '21+', count: 0, percentage: 0 }
    ];

    complexity.forEach(c => {
      if (c.complexity <= 5) distribution[0].count++;
      else if (c.complexity <= 10) distribution[1].count++;
      else if (c.complexity <= 15) distribution[2].count++;
      else if (c.complexity <= 20) distribution[3].count++;
      else distribution[4].count++;
    });

    distribution.forEach(d => {
      d.percentage = complexity.length > 0 
        ? Math.round((d.count / complexity.length) * 100) 
        : 0;
    });

    // Top complex functions
    const topComplex = [...complexity]
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 10);

    // Graph metrics
    const allNodes = graph.getAllNodes();
    const allEdges = graph.getAllEdges();
    const called = new Set(allEdges.map(e => e.to));
    const entryPoints = allNodes.filter(n => !called.has(n.id)).length;
    
    const callers = new Set(allEdges.map(e => e.from));
    const leafFunctions = allNodes.filter(n => !callers.has(n.id)).length;

    const circularDeps = graph.getCircularDependencies().length;
    const mostImported = graph.getMostImportedFiles().slice(0, 5);

    return {
      projectName,
      timestamp: new Date().toISOString(),
      fileCount,
      functionCount: complexity.length,
      avgComplexity: parseFloat(avgComplexity.toFixed(2)),
      maxComplexity,
      complexityDistribution: distribution,
      topComplexFunctions: topComplex,
      entryPoints,
      leafFunctions,
      circularDependencies: circularDeps,
      mostImportedFiles: mostImported
    };
  }

  private buildHTML(data: ReportData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGraph Report - ${data.projectName}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #1f1f1f;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(
                180deg,
                #2a2a2e 0%,
                #151518 100%
              );
            color: white;
            padding: 40px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }

        .content {
            padding: 40px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: #f8f9fa;
            padding: 24px;
            border-radius: 12px;
            border-left: 4px solid #26262a;
            transition: transform 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            color: #212529;
            font-size: 2rem;
            font-weight: 700;
        }

        .section {
            margin-bottom: 40px;
        }

        .section h2 {
            color: #212529;
            font-size: 1.8rem;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #48484e;
        }

        .chart-container {
            position: relative;
            height: 300px;
            margin-bottom: 40px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        thead {
            background: linear-gradient(
                180deg,
                #2a2a2e 0%,
                #151518 100%
              );
            color: white;
        }

        th {
            padding: 16px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }

        td {
            padding: 16px;
            border-bottom: 1px solid #dee2e6;
        }

        tbody tr:hover {
            background: #f8f9fa;
        }

        .complexity-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.85rem;
        }

        .complexity-low {
            background: #d4edda;
            color: #155724;
        }

        .complexity-medium {
            background: #fff3cd;
            color: #856404;
        }

        .complexity-high {
            background: #f8d7da;
            color: #721c24;
        }

        .footer {
            text-align: center;
            padding: 30px;
            background: #e9ecef;
            color: #6c757d;
            font-size: 0.9rem;
        }

        .footer a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }

        .footer a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .content {
                padding: 20px;
            }

            table {
                font-size: 0.85rem;
            }

            th, td {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> CodeGraph Analysis Report</h1>
            <p>${data.projectName}</p>
            <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">
                Generated on ${new Date(data.timestamp).toLocaleString()}
            </p>
        </div>

        <div class="content">
            <!-- Summary Statistics -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Files Analyzed</div>
                    <div class="stat-value">${data.fileCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Functions Found</div>
                    <div class="stat-value">${data.functionCount}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Complexity</div>
                    <div class="stat-value">${data.avgComplexity}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Max Complexity</div>
                    <div class="stat-value" style="color: ${data.maxComplexity > 15 ? '#dc3545' : '#667eea'}">
                        ${data.maxComplexity}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Entry Points</div>
                    <div class="stat-value">${data.entryPoints}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Leaf Functions</div>
                    <div class="stat-value">${data.leafFunctions}</div>
                </div>
            </div>

            <!-- Complexity Distribution Chart -->
            <div class="section">
                <h2>Complexity Distribution</h2>
                <div class="chart-container">
                    <canvas id="complexityChart"></canvas>
                </div>
            </div>

            <!-- Top Complex Functions -->
            <div class="section">
                <h2>Most Complex Functions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Function</th>
                            <th>Complexity</th>
                            <th>Lines</th>
                            <th>Parameters</th>
                            <th>File</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.topComplexFunctions.map((fn, index) => `
                            <tr>
                                <td><strong>${index + 1}</strong></td>
                                <td><code>${fn.name}</code></td>
                                <td>
                                    <span class="complexity-badge ${this.getComplexityClass(fn.complexity)}">
                                        ${fn.complexity}
                                    </span>
                                </td>
                                <td>${fn.lineCount}</td>
                                <td>${fn.paramCount}</td>
                                <td style="font-size: 0.85rem; color: #6c757d;">
                                    ${path.basename(fn.file)}:${fn.line}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Architecture Insights -->
            <div class="section">
                <h2>Architecture Insights</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Entry Points</div>
                        <div class="stat-value">${data.entryPoints}</div>
                        <p style="margin-top: 8px; color: #6c757d; font-size: 0.85rem;">
                            Functions not called by others
                        </p>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Leaf Functions</div>
                        <div class="stat-value">${data.leafFunctions}</div>
                        <p style="margin-top: 8px; color: #6c757d; font-size: 0.85rem;">
                            Functions that don't call others
                        </p>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Circular Dependencies</div>
                        <div class="stat-value" style="color: ${data.circularDependencies > 0 ? '#dc3545' : '#28a745'}">
                            ${data.circularDependencies}
                        </div>
                        <p style="margin-top: 8px; color: #6c757d; font-size: 0.85rem;">
                            ${data.circularDependencies === 0 ? '✅ Clean architecture' : '⚠️ Needs attention'}
                        </p>
                    </div>
                </div>
            </div>

            ${data.mostImportedFiles.length > 0 ? `
            <!-- Most Imported Files -->
            <div class="section">
                <h2>Most Imported Files</h2>
                <table>
                    <thead>
                        <tr>
                            <th>File</th>
                            <th>Import Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.mostImportedFiles.map(f => `
                            <tr>
                                <td><code>${f.file}</code></td>
                                <td><strong>${f.count}</strong> times</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            <!-- Recommendations -->
            <div class="section">
                <h2>Recommendations</h2>
                ${this.generateRecommendations(data)}
            </div>
        </div>

        <div class="footer">
            <p>Generated by <a href="https://github.com/YourUsername/codegraph" target="_blank">CodeGraph</a></p>
            <p style="margin-top: 8px;">AI-powered code analysis tool</p>
        </div>
    </div>

    <script>
        // Complexity Distribution Chart
        const ctx = document.getElementById('complexityChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(data.complexityDistribution.map(d => d.range))},
                datasets: [{
                    label: 'Number of Functions',
                    data: ${JSON.stringify(data.complexityDistribution.map(d => d.count))},
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(255, 152, 0, 0.8)',
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(108, 117, 125, 0.8)'
                    ],
                    borderColor: [
                        'rgb(40, 167, 69)',
                        'rgb(255, 193, 7)',
                        'rgb(255, 152, 0)',
                        'rgb(220, 53, 69)',
                        'rgb(108, 117, 125)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  private getComplexityClass(complexity: number): string {
    if (complexity <= 10) return 'complexity-low';
    if (complexity <= 15) return 'complexity-medium';
    return 'complexity-high';
  }

  private generateRecommendations(data: ReportData): string {
    const recommendations: string[] = [];

    // High complexity functions
    const highComplexity = data.topComplexFunctions.filter(f => f.complexity > 15);
    if (highComplexity.length > 0) {
      recommendations.push(`
        <div style="padding: 16px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 8px; margin-bottom: 16px;">
          <strong> High Complexity Alert:</strong> ${highComplexity.length} function(s) have complexity >15. 
          Consider refactoring for better maintainability.
        </div>
      `);
    }

    // Circular dependencies
    if (data.circularDependencies > 0) {
      recommendations.push(`
        <div style="padding: 16px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px; margin-bottom: 16px;">
          <strong> Circular Dependencies:</strong> Found ${data.circularDependencies} circular dependency chain(s). 
          This can lead to module loading issues and tight coupling.
        </div>
      `);
    }

    // Good practices
    if (data.avgComplexity <= 5) {
      recommendations.push(`
        <div style="padding: 16px; background: #d4edda; border-left: 4px solid #28a745; border-radius: 8px; margin-bottom: 16px;">
          <strong> Great Job!</strong> Your average complexity (${data.avgComplexity}) is excellent. 
          Keep maintaining this standard.
        </div>
      `);
    }

    if (recommendations.length === 0) {
      recommendations.push(`
        <div style="padding: 16px; background: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 8px;">
          <strong> Looking Good:</strong> No critical issues found. Continue monitoring complexity as the codebase grows.
        </div>
      `);
    }

    return recommendations.join('');
  }

  saveHTMLReport(html: string, outputPath: string): void {
    fs.writeFileSync(outputPath, html);
  }
}