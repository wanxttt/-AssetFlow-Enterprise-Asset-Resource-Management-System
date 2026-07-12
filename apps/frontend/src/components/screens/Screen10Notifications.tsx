"use client";
import { useState, useEffect } from "react";

export default function Screen10Notifications() {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [customMsg, setCustomMsg] = useState("");
  const [customType, setCustomType] = useState("Alerts");
  const [showModal, setShowModal] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3005/api/notifications", {
        headers: { "x-user-role": "ADMIN" }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg) return;

    const newNotif = {
      id: "demo-" + Date.now(),
      type: customType,
      message: customMsg,
      time: "Just now"
    };

    setNotifications([newNotif, ...notifications]);
    setCustomMsg("");
    setShowModal(false);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filtered = activeTab === "All"
    ? notifications
    : notifications.filter(n => n.type === activeTab);

  const tabs = ["All", "Alerts", "Approvals", "Bookings"];

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Notifications & System Alerts</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time enterprise event stream & audit alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            + New Demo Alert
          </button>
          <button
            onClick={fetchNotifications}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            Refresh Feed
          </button>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="mb-6 bg-white border border-slate-200 p-6 rounded-2xl shadow-md">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Create Interactive Demo Alert</h3>
          <form onSubmit={handleAddNotification} className="flex flex-col md:flex-row gap-4">
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 outline-none shadow-sm"
            >
              <option value="Alerts" className="text-slate-900 bg-white font-medium">Alerts</option>
              <option value="Approvals" className="text-slate-900 bg-white font-medium">Approvals</option>
              <option value="Bookings" className="text-slate-900 bg-white font-medium">Bookings</option>
            </select>
            <input
              type="text"
              placeholder="E.g. High-priority maintenance audit required for AF-1012..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none shadow-sm"
              required
            />
            <button
              type="submit"
              className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-slate-800"
            >
              Broadcast Alert
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-slate-100 text-slate-700 px-4 py-3 rounded-xl text-sm font-semibold"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="flex space-x-1 border-b border-slate-200 mb-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3.5 font-semibold text-sm transition-all border-b-2 ${
              activeTab === tab
                ? "border-slate-900 text-slate-900 bg-slate-50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {filtered.length > 0 ? (
            filtered.map((n, index) => (
              <li
                key={n.id || index}
                className="p-6 hover:bg-slate-50/80 transition-colors flex justify-between items-start cursor-pointer"
              >
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-3 border ${
                      n.type === "Alerts"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : n.type === "Approvals"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {n.type}
                  </span>
                  <p className="text-slate-800 text-sm font-medium">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  {n.time}
                </span>
              </li>
            ))
          ) : (
            <li className="p-12 text-center flex flex-col items-center text-slate-500">
              <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-sm font-medium">No {activeTab.toLowerCase()} notifications right now.</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
