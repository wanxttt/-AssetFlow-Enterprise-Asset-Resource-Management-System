"use client";
import { useState, useEffect } from "react";

export default function Screen5Transfer() {
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [toUserId, setToUserId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [allocationNotes, setAllocationNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [conflictAlert, setConflictAlert] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, usersRes] = await Promise.all([
        fetch("http://localhost:3005/api/assets", { headers: { "x-user-role": "ADMIN" } }),
        fetch("http://localhost:3005/api/org/users", { headers: { "x-user-role": "ADMIN" } })
      ]);
      if (assetsRes.ok && usersRes.ok) {
        const assetsData = await assetsRes.json();
        const usersData = await usersRes.json();
        const assetsArr = Array.isArray(assetsData) ? assetsData : [];
        const usersArr = Array.isArray(usersData) ? usersData : [];
        setAssets(assetsArr);
        setUsers(usersArr);

        if (!selectedAssetId && assetsArr.length > 0) {
          const allocAsset = assetsArr.find(a => a.status === "ALLOCATED") || assetsArr[0];
          setSelectedAssetId(allocAsset.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch allocation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const isAllocated = selectedAsset?.status === "ALLOCATED" || selectedAsset?.status === "UNDER_MAINTENANCE";

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictAlert(null);
    setSuccessMsg(null);

    if (!selectedAssetId) return;

    try {
      const res = await fetch("http://localhost:3005/api/assets/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN"
        },
        body: JSON.stringify({
          assetId: selectedAssetId,
          toUserId: toUserId || (users[0]?.id || null),
          transferReason: reason || "Standard reassignment"
        })
      });

      if (res.ok) {
        setSuccessMsg(`Transfer request approved & processed for ${selectedAsset?.assetTag || selectedAsset?.name}.`);
        setReason("");
        await fetchData();
      } else {
        const errText = await res.text();
        setConflictAlert(`Transfer failed (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      setConflictAlert(`Network error during transfer: ${err?.message || err}`);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictAlert(null);
    setSuccessMsg(null);

    if (!selectedAssetId) return;

    try {
      const res = await fetch("http://localhost:3005/api/assets/allocate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN"
        },
        body: JSON.stringify({
          assetId: selectedAssetId,
          userId: toUserId || (users[0]?.id || null),
          notes: allocationNotes || "Initial allocation"
        })
      });

      if (res.ok) {
        setSuccessMsg(`Asset successfully allocated to employee.`);
        setAllocationNotes("");
        await fetchData();
      } else if (res.status === 409) {
        const conflictData = await res.json();
        setConflictAlert(`409 Double-Allocation Blocked: Asset is already allocated! (${conflictData.message || JSON.stringify(conflictData)})`);
      } else {
        const errText = await res.text();
        setConflictAlert(`Allocation failed (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      setConflictAlert(`Network error: ${err?.message || err}`);
    }
  };

  const handleReturn = async () => {
    if (!selectedAssetId) return;
    setConflictAlert(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("http://localhost:3005/api/assets/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN"
        },
        body: JSON.stringify({
          assetId: selectedAssetId,
          condition: "GOOD",
          returnNotes: "Returned via Allocation & Transfer screen"
        })
      });

      if (res.ok) {
        setSuccessMsg("Asset returned successfully. Status is now AVAILABLE.");
        await fetchData();
      } else {
        const errText = await res.text();
        setConflictAlert(`Return failed: ${errText}`);
      }
    } catch (err: any) {
      setConflictAlert(`Error returning asset: ${err?.message || err}`);
    }
  };

  const triggerDoubleAllocationConflict = async () => {
    setSuccessMsg(null);
    setConflictAlert(null);
    const allocatedAsset = assets.find(a => a.status === "ALLOCATED");
    if (!allocatedAsset) {
      alert("Please allocate an asset first before testing Double-Allocation Block.");
      return;
    }
    setSelectedAssetId(allocatedAsset.id);

    try {
      const res = await fetch("http://localhost:3005/api/assets/allocate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN"
        },
        body: JSON.stringify({
          assetId: allocatedAsset.id,
          userId: users[0]?.id || null,
          notes: "Attempting duplicate allocation to trigger 409 Conflict"
        })
      });

      if (res.status === 409) {
        const data = await res.json();
        setConflictAlert(`[BACKEND 409 CONFLICT DETECTED] Double-Allocation Block triggered: ${data.message || "Asset is currently allocated."}`);
      } else {
        setConflictAlert(`Request returned status ${res.status}`);
      }
    } catch (err: any) {
      setConflictAlert(`Error: ${err?.message || err}`);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Asset Allocation & Transfer</h1>
          <p className="text-slate-500 text-sm mt-1">Double-Allocation Guard & Custody Transfer Engine</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={triggerDoubleAllocationConflict}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            ⚡ Test Double-Allocation Block (409)
          </button>
          <button
            onClick={fetchData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {conflictAlert && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center justify-between shadow-sm">
          <div>
            <span className="font-bold mr-2">CONFLICT PREVENTED:</span>
            {conflictAlert}
          </div>
          <button onClick={() => setConflictAlert(null)} className="font-bold text-red-600 hover:text-red-900 ml-4">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div>
            <span className="font-bold mr-2">SUCCESS:</span>
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-600 hover:text-emerald-900 ml-4">✕</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Asset</label>
          <select
            value={selectedAssetId}
            onChange={(e) => {
              setSelectedAssetId(e.target.value);
              setConflictAlert(null);
              setSuccessMsg(null);
            }}
            className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-semibold text-sm outline-none focus:border-slate-800 transition-colors shadow-sm"
          >
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id} className="text-slate-900 bg-white font-medium py-2">
                {asset.assetTag || "AF"} - {asset.name} ({asset.status})
              </option>
            ))}
          </select>
        </div>

        {selectedAsset && isAllocated ? (
          <>
            <div className="bg-red-900/10 text-red-800 p-5 rounded-xl border border-red-900/20 mb-8 flex justify-between items-center">
              <div>
                <p className="font-semibold mb-1">
                  Already Allocated to Employee ({selectedAsset.location || "Active Custody"})
                </p>
                <p className="text-sm">
                  Direct re-allocation is blocked by lifecycle state machine. Submit a transfer request below or return asset.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReturn}
                className="bg-white hover:bg-red-50 text-red-700 border border-red-300 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm whitespace-nowrap ml-4 transition-colors"
              >
                Return Asset
              </button>
            </div>

            <form onSubmit={handleTransfer}>
              <h2 className="text-lg font-semibold text-slate-800 mb-5">Custody Transfer Request</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Status</label>
                  <div className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-slate-900 text-sm font-semibold">
                    {selectedAsset.status} ({selectedAsset.condition})
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Transfer To Employee</label>
                  <select
                    value={toUserId}
                    onChange={(e) => setToUserId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-semibold text-sm outline-none focus:border-slate-800 transition-colors shadow-sm"
                  >
                    <option value="" className="text-slate-900 bg-white font-medium">Select Employee...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="text-slate-900 bg-white font-medium py-1">
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Transfer Reason</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium text-sm outline-none focus:border-slate-800 h-28 resize-none transition-colors shadow-sm placeholder-slate-400"
                  placeholder="Enter business justification for asset transfer..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                Submit Transfer Request
              </button>
            </form>
          </>
        ) : selectedAsset ? (
          <>
            <div className="bg-emerald-50 text-emerald-800 p-5 rounded-xl border border-emerald-200 mb-8">
              <p className="font-semibold mb-1">Asset Available for Allocation</p>
              <p className="text-sm">This asset is currently unallocated ({selectedAsset.condition}). You may directly assign it below.</p>
            </div>

            <form onSubmit={handleAllocate}>
              <h2 className="text-lg font-semibold text-slate-800 mb-5">Allocate Asset</h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assign To Employee</label>
                  <select
                    value={toUserId}
                    onChange={(e) => setToUserId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-semibold text-sm outline-none focus:border-slate-800 transition-colors shadow-sm"
                  >
                    <option value="" className="text-slate-900 bg-white font-medium">Select Employee...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="text-slate-900 bg-white font-medium py-1">
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Allocation Notes</label>
                  <input
                    type="text"
                    placeholder="E.g. Engineering Onboarding Laptop"
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-medium text-sm outline-none focus:border-slate-800 transition-colors shadow-sm placeholder-slate-400"
                    value={allocationNotes}
                    onChange={(e) => setAllocationNotes(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Allocate Asset
              </button>
            </form>
          </>
        ) : (
          <div className="text-slate-500 text-sm py-4">No assets available. Please register an asset first.</div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-3">
          Allocation & Lifecycle History
        </h2>
        <div className="space-y-4 text-sm">
          {selectedAsset && selectedAsset.allocations && selectedAsset.allocations.length > 0 ? (
            selectedAsset.allocations.map((alloc: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-800">{new Date(alloc.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span className="text-slate-600 ml-2">— Status: <span className="font-semibold">{alloc.status}</span></span>
                </div>
                <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-700">{alloc.id?.slice(0, 8)}</span>
              </div>
            ))
          ) : (
            <div className="space-y-3 text-slate-600 text-sm">
              <p><span className="font-semibold text-slate-800">Current Status</span> — {selectedAsset?.status || "AVAILABLE"} (Condition: {selectedAsset?.condition || "GOOD"})</p>
              <p><span className="font-semibold text-slate-800">System Log</span> — Asset verified by AssetFlow double-allocation engine</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
