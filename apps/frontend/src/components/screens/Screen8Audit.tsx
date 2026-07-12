"use client";
import { useState } from "react";

export default function Screen8Audit() {
  const [assets, setAssets] = useState([
    { id: "AF-0012", name: "Dell Laptop", location: "Bengaluru", status: "Pending" },
    { id: "AF-0062", name: "Projector", location: "HQ floor 2", status: "Pending" },
    { id: "AF-0201", name: "Office Chair", location: "Warehouse", status: "Pending" },
  ]);

  const updateStatus = (id: string, newStatus: string) => {
    setAssets(assets.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleGenerateReport = () => {
    alert("Discrepancy Report Generated (Simulated for Frontend)");
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Asset Audit</h1>
          <p className="text-slate-500 mt-1 text-sm">Active Cycle: Q3 Engineering Audit</p>
        </div>
        <button onClick={handleGenerateReport} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-slate-800 transition-colors text-sm">
          Generate Discrepancy Report
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 font-semibold text-slate-600 text-sm">Tag</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Name</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Location</th>
              <th className="p-5 font-semibold text-slate-600 text-sm text-center">Audit Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map(asset => (
              <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-medium text-slate-800 text-sm">{asset.id}</td>
                <td className="p-5 text-slate-600 text-sm">{asset.name}</td>
                <td className="p-5 text-slate-600 text-sm">{asset.location}</td>
                <td className="p-5 text-center">
                  {asset.status === "Pending" ? (
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => updateStatus(asset.id, "Verified")} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors">Verified</button>
                      <button onClick={() => updateStatus(asset.id, "Missing")} className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">Missing</button>
                      <button onClick={() => updateStatus(asset.id, "Damaged")} className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors">Damaged</button>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold border ${
                      asset.status === "Verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      asset.status === "Missing" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {asset.status}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
