"use client";
import { useState, useEffect } from "react";

export default function Screen6Booking() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:30");
  const [endTime, setEndTime] = useState<string>("10:30");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, assetsRes, usersRes] = await Promise.all([
        fetch("http://localhost:3005/api/bookings", { headers: { "x-user-role": "ADMIN" } }),
        fetch("http://localhost:3005/api/assets", { headers: { "x-user-role": "ADMIN" } }),
        fetch("http://localhost:3005/api/org/users", { headers: { "x-user-role": "ADMIN" } })
      ]);
      if (bookingsRes.ok && assetsRes.ok && usersRes.ok) {
        const bookingsData = await bookingsRes.json();
        const assetsData = await assetsRes.json();
        const usersData = await usersRes.json();
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setAssets(Array.isArray(assetsData) ? assetsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);

        if (!selectedAssetId && Array.isArray(assetsData) && assetsData.length > 0) {
          setSelectedAssetId(assetsData[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch resource booking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMsg(null);
    setSuccessMsg(null);

    if (!selectedAssetId) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const startIso = new Date(`${todayStr}T${startTime}:00`).toISOString();
    const endIso = new Date(`${todayStr}T${endTime}:00`).toISOString();

    try {
      const res = await fetch("http://localhost:3005/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN"
        },
        body: JSON.stringify({
          assetId: selectedAssetId,
          userId: selectedUserId || (users[0]?.id || null),
          startTime: startIso,
          endTime: endIso,
          purpose: purpose || "Team Conference & Sync"
        })
      });

      if (res.ok) {
        setSuccessMsg("Resource booked successfully without scheduling overlap.");
        setPurpose("");
        await fetchData();
      } else if (res.status === 409) {
        const errData = await res.json();
        setConflictMsg(`[409 BOOKING CONFLICT DETECTED] Overlap prevented! ${errData.message || JSON.stringify(errData)}`);
      } else {
        const errText = await res.text();
        setConflictMsg(`Booking failed (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      setConflictMsg(`Network error: ${err?.message || err}`);
    }
  };

  const triggerOverlapConflictDemo = async () => {
    setConflictMsg(null);
    setSuccessMsg(null);
    if (!selectedAssetId) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const startIso = new Date(`${todayStr}T09:00:00`).toISOString();
    const endIso = new Date(`${todayStr}T10:00:00`).toISOString();

    try {
      await fetch("http://localhost:3005/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "ADMIN" },
        body: JSON.stringify({
          assetId: selectedAssetId,
          userId: users[0]?.id || null,
          startTime: startIso,
          endTime: endIso,
          purpose: "Team Sync (Aditi Rao)"
        })
      });

      const overlapStart = new Date(`${todayStr}T09:30:00`).toISOString();
      const overlapEnd = new Date(`${todayStr}T10:30:00`).toISOString();

      const res = await fetch("http://localhost:3005/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "ADMIN" },
        body: JSON.stringify({
          assetId: selectedAssetId,
          userId: users[1]?.id || users[0]?.id || null,
          startTime: overlapStart,
          endTime: overlapEnd,
          purpose: "Client Call (Rohan Mehta)"
        })
      });

      if (res.status === 409) {
        const conflictData = await res.json();
        setConflictMsg(`Booking Conflict Detected: "Client Call" overlaps with existing booking from 9:30 AM to 10:30 AM! (${conflictData.message || "Overlap verified"})`);
      } else {
        setSuccessMsg(`Booking returned status ${res.status}`);
      }
      await fetchData();
    } catch (err: any) {
      setConflictMsg(`Demo trigger error: ${err?.message || err}`);
    }
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Resource Booking</h1>
          <p className="text-slate-500 text-sm mt-1">Real-Time Schedule Overlap Detection & Reservation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={triggerOverlapConflictDemo}
            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            ⚡ Test Booking Conflict (409)
          </button>
          <button
            onClick={fetchData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            Refresh Schedule
          </button>
        </div>
      </div>

      {conflictMsg && (
        <div className="mb-6 p-5 bg-red-900/10 text-red-800 rounded-xl border border-red-900/20 text-sm flex items-center justify-between shadow-sm">
          <div>
            <strong className="font-semibold block mb-1">Booking Conflict Detected:</strong>
            {conflictMsg}
          </div>
          <button onClick={() => setConflictMsg(null)} className="font-bold text-red-600 hover:text-red-900 ml-4">✕</button>
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

      {/* Visual Timeline Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Conference Room & Resource Schedule - Today</h2>

        <div className="relative h-64 border-l border-b border-slate-200 mb-6 ml-16">
          <div className="absolute -left-16 top-0 text-xs text-slate-500 font-medium">9:00 AM</div>
          <div className="absolute -left-16 top-1/4 text-xs text-slate-500 font-medium">9:30 AM</div>
          <div className="absolute -left-16 top-2/4 text-xs text-slate-500 font-medium">10:00 AM</div>
          <div className="absolute -left-16 top-3/4 text-xs text-slate-500 font-medium">10:30 AM</div>

          <div className="absolute w-full border-t border-slate-100 top-0"></div>
          <div className="absolute w-full border-t border-slate-100 top-1/4"></div>
          <div className="absolute w-full border-t border-slate-200 top-2/4"></div>
          <div className="absolute w-full border-t border-slate-100 top-3/4"></div>

          {bookings.length > 0 ? (
            bookings.map((b: any, idx: number) => {
              const colors = [
                "bg-emerald-50 border-emerald-500 text-emerald-900",
                "bg-blue-50 border-blue-500 text-blue-900",
                "bg-purple-50 border-purple-500 text-purple-900"
              ];
              const colorClass = colors[idx % colors.length];
              const startDt = new Date(b.startTime);
              const endDt = new Date(b.endTime);
              return (
                <div
                  key={b.id || idx}
                  style={{ left: `${(idx * 30) % 65}%`, width: "32%", top: `${idx * 20}%`, height: "45%" }}
                  className={`absolute border-l-4 rounded-r-lg p-3 opacity-90 shadow-sm z-10 ${colorClass}`}
                >
                  <p className="text-xs font-bold truncate">{b.purpose || "Reserved Slot"}</p>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    {startDt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {endDt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              );
            })
          ) : (
            <>
              <div className="absolute top-0 left-4 w-1/3 h-2/4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-4 opacity-90 shadow-sm z-10">
                <p className="text-sm font-bold text-emerald-900">Team Sync</p>
                <p className="text-xs text-emerald-700 mt-1">Aditi Rao</p>
              </div>

              <div className="absolute top-1/4 left-[35%] w-1/3 h-2/4 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 opacity-90 shadow-lg z-20">
                <p className="text-sm font-bold text-red-900">Client Call</p>
                <p className="text-xs text-red-700 mt-1">Rohan Mehta</p>
                <div className="text-[10px] font-bold text-red-900 mt-2 flex items-center bg-red-100 w-fit px-2 py-0.5 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse"></span> CONFLICT
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex justify-between items-center">
          <span>Active server bookings listed: <strong>{bookings.length}</strong></span>
          <span>Overlap checks are performed atomically via backend interval intersection</span>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Book Resource / Conference Room</h2>
        <form onSubmit={handleCreateBooking}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Resource / Room</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-semibold text-sm outline-none focus:border-slate-800 transition-colors shadow-sm"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id} className="text-slate-900 bg-white font-medium py-1">
                    {asset.assetTag || "AF"} - {asset.name} ({asset.location || "HQ"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Booked For Employee</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time (HH:MM)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-semibold text-sm outline-none focus:border-slate-800 transition-colors shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Time (HH:MM)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-semibold text-sm outline-none focus:border-slate-800 transition-colors shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting / Booking Purpose</label>
              <input
                type="text"
                placeholder="E.g. Q3 Architecture Review"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-slate-900 font-semibold text-sm outline-none focus:border-slate-800 transition-colors shadow-sm placeholder-slate-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm text-sm"
          >
            Submit Booking Request
          </button>
        </form>
      </div>
    </div>
  );
}
