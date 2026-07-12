"use client";
import { useState } from "react";

export default function Screen5Transfer() {
  const [employeeName, setEmployeeName] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Transfer Request Submitted:");
    console.log("To Employee:", employeeName);
    console.log("Reason:", reason);
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Asset allocation & Transfer (Double-allocation block)</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Asset</label>
          <div className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-800 font-medium text-sm">
            AF-0114 - Dell laptop
          </div>
        </div>

        <div className="bg-red-900/10 text-red-800 p-5 rounded-xl border border-red-900/20 mb-8">
          <p className="font-semibold mb-1">Already Allocated to Priya shah (Engineering)</p>
          <p className="text-sm">Direct re-allocation is blocked - submit a transfer request below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-slate-800 mb-5">Transfer Request</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">From</label>
              <div className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-500 text-sm">
                Priya Shah
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">To</label>
              <input 
                type="text" 
                placeholder="Select Employee...." 
                className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-slate-800 text-sm transition-colors"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Reason</label>
            <textarea 
              className="w-full border border-slate-300 rounded-xl p-3.5 outline-none focus:border-slate-800 h-32 resize-none text-sm transition-colors"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm">
            Submit Request
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">Allocation history</h2>
      <div className="space-y-3 text-slate-600 text-sm">
        <p><span className="font-semibold text-slate-800">Mar 12</span> - Allocated to Priya shah - Engineering</p>
        <p><span className="font-semibold text-slate-800">Jan 04</span> - Returned by Arjun Nair - condition: good</p>
      </div>
    </div>
  );
}
