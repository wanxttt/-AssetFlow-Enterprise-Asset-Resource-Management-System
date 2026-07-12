"use client";

import { useState, useEffect } from "react";

export default function Screen2Overview() {
  const [totalAssets, setTotalAssets] = useState("0");

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await fetch("http://localhost:3005/api/assets");
        if (res.ok) {
          const data = await res.json();
          setTotalAssets(data.count.toString());
        } else {
          setTimeout(() => setTotalAssets("1245"), 500);
        }
      } catch (error) {
        setTimeout(() => setTotalAssets("1245"), 500);
      }
    }
    fetchAssets();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Today's Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium">Available</h2>
          <p className="text-4xl font-light text-slate-800 mt-3">128</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium">Allocated</h2>
          <p className="text-4xl font-light text-slate-800 mt-3">76</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium">Total Assets (API)</h2>
          <p className="text-4xl font-light text-slate-800 mt-3">{totalAssets}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium">Active Bookings</h2>
          <p className="text-4xl font-light text-slate-800 mt-3">9</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium">Pending Transfers</h2>
          <p className="text-4xl font-light text-slate-800 mt-3">3</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-slate-500 text-sm font-medium">Upcoming returns</h2>
          <p className="text-4xl font-light text-slate-800 mt-3">12</p>
        </div>
      </div>

      <div className="bg-red-900/10 text-red-800 p-4 rounded-xl border border-red-900/20 mb-8 font-medium">
        3 assets overdue for return - flagged for follow-up
      </div>

      <div className="flex space-x-4 mb-10">
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors">
          + register asset
        </button>
        <button className="border border-slate-300 bg-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors">
          Book resource
        </button>
        <button className="border border-slate-300 bg-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors">
          Raise requests
        </button>
      </div>

      <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
      <div className="space-y-3 text-slate-600 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p>Laptop AF-0114 - allocated to Priya shah - IT dept</p>
        <p>Room B2 - booking confirmed - 2:00 to 3:00 PM</p>
        <p>Projector AF-0062 - maintenance resolved</p>
      </div>
    </div>
  );
}
