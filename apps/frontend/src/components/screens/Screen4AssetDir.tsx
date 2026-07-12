"use client";
import { useState, useEffect } from "react";

export default function Screen4AssetDir() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      const res = await fetch("http://localhost:3005/api/assets");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAssets(data);
        } else if (data.count !== undefined) {
          setAssets([]);
        }
      } else {
        const errText = await res.text();
        console.error("GET /api/assets failed:", res.status, errText);
        alert(`Failed to fetch assets (Status ${res.status})`);
      }
    } catch (error: any) {
      console.error("Failed to fetch assets:", error);
      alert(`Network Error fetching assets: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRegisterAsset = async () => {
    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch("http://localhost:3005/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN",
        },
        body: JSON.stringify({
          name: `MacBook Pro M3 #${randomId}`,
          location: "Headquarters - Tech Bay",
          category: "Hardware",
          condition: "GOOD",
        }),
      });
      if (res.ok) {
        await fetchAssets(); // Immediate state refresh without reload
      } else {
        const errData = await res.text();
        console.error("POST /api/assets failed:", res.status, errData);
        alert(`Failed to register asset: ${errData || res.statusText}`);
      }
    } catch (error: any) {
      console.error("Failed to register asset:", error);
      alert(`Error registering asset: ${error?.message || error}`);
    }
  };

  const filteredAssets = assets.filter((asset: any) =>
    (asset.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (asset.assetTag?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Asset registrations and directory</h1>

      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          placeholder="Search by tag, serial, or QR code.."
          className="flex-1 bg-white border border-slate-300 rounded-xl p-3 px-5 text-slate-900 font-semibold placeholder-slate-400 outline-none focus:border-slate-800 transition-colors shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleRegisterAsset}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors whitespace-nowrap text-sm shadow-sm"
        >
          + Register Asset
        </button>
      </div>

      <div className="flex space-x-3 mb-8">
        <button className="border border-slate-300 bg-white px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">Category</button>
        <button className="border border-slate-300 bg-white px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">Status</button>
        <button className="border border-slate-300 bg-white px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">Department</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 font-semibold text-slate-600 text-sm">Tag</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Name</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Status</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Loading assets from DB...</td>
              </tr>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset: any) => (
                <tr key={asset.id || asset.assetTag} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-medium text-slate-800">{asset.assetTag}</td>
                  <td className="p-5 text-slate-600">{asset.name}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-5 text-slate-600">{asset.location || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No assets found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
