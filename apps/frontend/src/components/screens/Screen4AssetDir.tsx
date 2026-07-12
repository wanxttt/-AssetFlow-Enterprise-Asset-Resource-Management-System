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
        // Defensive check to ensure we get an array
        if (Array.isArray(data)) {
          setAssets(data);
        } else if (data.count !== undefined) {
          setAssets([]); // Fallback if backend still returning mock count
        }
      } else {
        console.error("Fetch returned non-OK status");
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRegisterAsset = async () => {
    try {
      const res = await fetch("http://localhost:3005/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Registered Asset", location: "Warehouse" }),
      });
      if (res.ok) {
        fetchAssets(); // Refresh list automatically
      } else {
        console.error("POST /api/assets failed");
      }
    } catch (error) {
      console.error("Failed to register asset:", error);
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
          className="flex-1 border border-slate-300 rounded-xl p-3 px-5 outline-none focus:border-slate-800 transition-colors shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleRegisterAsset} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors whitespace-nowrap text-sm">
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
               <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading assets from DB...</td></tr>
            ) : filteredAssets.length > 0 ? (
              filteredAssets.map((asset: any) => (
                <tr key={asset.assetTag} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-medium text-slate-800">{asset.assetTag}</td>
                  <td className="p-5 text-slate-600">{asset.name}</td>
                  <td className="p-5 text-slate-600">{asset.status}</td>
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
