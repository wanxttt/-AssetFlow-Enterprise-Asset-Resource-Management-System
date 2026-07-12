"use client";
import { useState, useEffect } from "react";

export default function Screen2Overview() {
  const [totalAssets, setTotalAssets] = useState("Loading...");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:3005/api/assets");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTotalAssets(data.length.toString());
          } else if (data.count !== undefined) {
            setTotalAssets(data.count.toString());
          }
        } else {
          setTotalAssets("0");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setTotalAssets("0 (Offline)");
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Executive Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Assets</p>
          <p className="text-3xl font-bold text-slate-900">{totalAssets}</p>
          <span className="text-xs text-emerald-600 font-medium mt-2 inline-block">Connected to DB</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Transfers</p>
          <p className="text-3xl font-bold text-slate-900">14</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Maintenance Open</p>
          <p className="text-3xl font-bold text-slate-900">3</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audit Completion</p>
          <p className="text-3xl font-bold text-slate-900">82%</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">System Status</h2>
        <p className="text-sm text-slate-600">
          All API requests are routed to <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-mono">http://localhost:3005/api/*</code>.
        </p>
      </div>
    </div>
  );
}
