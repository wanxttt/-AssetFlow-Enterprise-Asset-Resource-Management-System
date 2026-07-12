"use client";
import { useState, useEffect } from "react";

function useNotifications() {
  const [activeTab, setActiveTab] = useState("All");
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("http://localhost:3005/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setAllNotifications(data);
        } else {
          console.error("Failed to fetch notifications from backend");
        }
      } catch (error) {
        console.error("Failed to fetch notifications (network error):", error);
      }
    }
    fetchNotifications();
  }, []);

  const filtered = activeTab === "All" 
    ? allNotifications 
    : allNotifications.filter(n => n.type === activeTab);

  return { activeTab, setActiveTab, notifications: filtered };
}

export default function Screen10Notifications() {
  const { activeTab, setActiveTab, notifications } = useNotifications();
  const tabs = ["All", "Alerts", "Approvals", "Bookings"];

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Notifications Center</h1>
      
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
          {notifications.length > 0 ? (
            notifications.map(n => (
              <li key={n.id} className="p-6 hover:bg-slate-50/80 transition-colors flex justify-between items-start cursor-pointer">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-3 border ${
                    n.type === 'Alerts' ? 'bg-red-50 text-red-700 border-red-200' :
                    n.type === 'Approvals' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {n.type}
                  </span>
                  <p className="text-slate-800 text-sm font-medium">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{n.time}</span>
              </li>
            ))
          ) : (
            <li className="p-12 text-center flex flex-col items-center text-slate-500">
              <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm font-medium">No {activeTab.toLowerCase()} notifications right now.</p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
