"use client";
import { useState, useEffect } from "react";

export default function Screen8Audit() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3005/api/audit");
      if (res.ok) {
        const data = await res.json();
        setAssets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch audit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setBannerMsg(null);
    try {
      const res = await fetch(`http://localhost:3005/api/audit/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBannerMsg(`Asset marked as ${newStatus} in audit ledger.`);
        await fetchAuditData();
      } else {
        setBannerMsg(`Failed to mark status (${res.status}): ${await res.text()}`);
      }
    } catch (err: any) {
      setBannerMsg(`Network Error: ${err?.message || err}`);
    }
  };

  const handleGenerateReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "AssetTag,Name,AuditedStatus,Location,LastAudited\n" +
      assets
        .map(a => `${a.assetTag || "AF"},"${a.name}",${a.status},"${a.location || "HQ"}",${a.updatedAt || new Date().toISOString()}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setBannerMsg("Compliance audit CSV exported successfully.");
  };

  const verifiedCount = assets.filter(a => a.status === "VERIFIED").length;
  const missingCount = assets.filter(a => a.status === "MISSING").length;
  const pendingCount = assets.filter(a => a.status !== "VERIFIED" && a.status !== "MISSING").length;
  const totalCount = assets.length;
  const complianceRate = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;

  const filtered = assets.filter(a => {
    const matchesSearch =
      (a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.assetTag || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            COMPLIANCE & RECONCILIATION
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">Physical Audit & Inventory Verification</h1>
          <p className="text-slate-500 text-sm mt-1">Sox-compliant physical verification ledger and QR custodian checks</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateReport}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
          >
            <span>📥 Export Reconciliation CSV</span>
          </button>
          <button
            onClick={fetchAuditData}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Refresh Ledger
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="mb-6 p-4 bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center justify-between shadow-md">
          <span>🛡️ {bannerMsg}</span>
          <button onClick={() => setBannerMsg(null)} className="font-bold text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Compliance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Score</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{complianceRate}%</p>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
            Target: 98.0%
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Assets</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{verifiedCount}</p>
          <span className="text-xs text-slate-400 font-medium mt-2 inline-block">Physically Inspected</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Check</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-xs text-slate-400 font-medium mt-2 inline-block">Awaiting Field Audit</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Missing Flagged</p>
          <p className="text-3xl font-extrabold text-red-600 mt-1">{missingCount}</p>
          <span className="text-xs text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded mt-2 inline-block">
            Investigate Immediately
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex space-x-2 bg-slate-200/60 p-1 rounded-xl w-fit">
          {["ALL", "VERIFIED", "MISSING", "PENDING"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by tag or asset name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Audit Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4 pl-6">Asset Tag</th>
              <th className="p-4">Description</th>
              <th className="p-4">Current Custodian</th>
              <th className="p-4">Audit Status</th>
              <th className="p-4 pr-6 text-right">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">Loading audit reconciliation ledger...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((asset: any) => {
                const status = asset.status || "PENDING";
                return (
                  <tr key={asset.id || asset.assetTag} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-900">{asset.assetTag || "AF-1001"}</td>
                    <td className="p-4 font-semibold text-slate-800">{asset.name}</td>
                    <td className="p-4 text-slate-600">{asset.assignedTo?.name || asset.location || "Active Inventory"}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          status === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : status === "MISSING"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="inline-flex space-x-2">
                        <button
                          onClick={() => updateStatus(asset.id, "VERIFIED")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
                        >
                          ✓ Mark Verified
                        </button>
                        <button
                          onClick={() => updateStatus(asset.id, "MISSING")}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ✕ Flag Missing
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">No assets match the active audit filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
