"use client";
import { useState } from "react";

const mockAssets = [
  { tag: "AF-0012", name: "Dell Laptop", category: "Electronics", status: "Allocated", location: "bengaluru" },
  { tag: "AF-0062", name: "Projector", category: "Electronics", status: "Maintenance", location: "HQ floor 2" },
  { tag: "AF-0201", name: "Office chair", category: "Furniture", status: "Available", location: "Warehouse" },
];

export default function Screen4AssetDir() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssets = mockAssets.filter((asset) => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.tag.toLowerCase().includes(searchTerm.toLowerCase())
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
        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors whitespace-nowrap text-sm">
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
              <th className="p-5 font-semibold text-slate-600 text-sm">Category</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Status</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <tr key={asset.tag} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5 font-medium text-slate-800">{asset.tag}</td>
                  <td className="p-5 text-slate-600">{asset.name}</td>
                  <td className="p-5 text-slate-600">{asset.category}</td>
                  <td className="p-5 text-slate-600">{asset.status}</td>
                  <td className="p-5 text-slate-600">{asset.location}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No assets found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
