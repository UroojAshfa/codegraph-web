"use client";

import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";

Chart.register(...registerables);

interface ComplexityChartProps {
  data: any;
}

export function ComplexityChart({ data }: ComplexityChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels = data.distribution.map((d: any) => d.range);
    const values = data.distribution.map((d: any) => d.count);

    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Number of Functions",
            data: values,
            backgroundColor: [
              "rgba(6, 182, 212, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(249, 115, 22, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
            borderColor: [
              "#06b6d4",
              "#10b981",
              "#f59e0b",
              "#f97316",
              "#ef4444",
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            titleColor: "#ffffff",
            bodyColor: "#e2e8f0",
            borderColor: "#06b6d4",
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              title: (items) => `Complexity: ${items[0].label}`,
              label: (item) => {
                const count = item.parsed.y ?? 0;  
                const total = data.functionCount || 1;
                const pct = ((count / total) * 100).toFixed(1);
                return `${count} functions (${pct}%)`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: "#64748b" },
            grid: { color: "rgba(148, 163, 184, 0.1)" },
          },
          x: {
            ticks: { color: "#64748b", font: { weight: 500 } }, 
            grid: { display: false },
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      chartRef.current?.destroy();
    };
  }, [data]);

  return (
    <div className="premium-card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Complexity Distribution
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          How complex are your functions?
        </p>
      </div>

      <div className="relative h-72">
        <canvas ref={canvasRef} />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        {[
          { color: "bg-cyan-500", label: "1-5: Pristine" },
          { color: "bg-emerald-500", label: "6-10: Clean" },
          { color: "bg-amber-500", label: "11-15: Moderate" },
          { color: "bg-orange-500", label: "16-20: Complex" },
          { color: "bg-red-500", label: "21+: Critical" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}