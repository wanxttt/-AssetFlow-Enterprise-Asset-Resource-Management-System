"use client";

import { useState } from "react";
import Screen1Login from "../components/screens/Screen1Login";
import Screen2Overview from "../components/screens/Screen2Overview";
import Screen3OrgSetup from "../components/screens/Screen3OrgSetup";
import Screen4AssetDir from "../components/screens/Screen4AssetDir";
import Screen5Transfer from "../components/screens/Screen5Transfer";
import Screen6Booking from "../components/screens/Screen6Booking";
import Screen7Kanban from "../components/screens/Screen7Kanban";
import Screen8Audit from "../components/screens/Screen8Audit";
import Screen9Reports from "../components/screens/Screen9Reports";
import Screen10Notifications from "../components/screens/Screen10Notifications";

export default function AppRouter() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");

  if (currentScreen === "login") {
    return <Screen1Login onLogin={() => setCurrentScreen("dashboard")} />;
  }

  const navItems = [
    { id: "dashboard", label: "Executive Overview", icon: "📊" },
    { id: "orgsetup", label: "Organization Setup", icon: "🏢" },
    { id: "assets", label: "Asset Directory", icon: "📦" },
    { id: "allocation", label: "Allocation & Transfer", icon: "🔄" },
    { id: "booking", label: "Resource Booking", icon: "📅" },
    { id: "maintenance", label: "Maintenance Board", icon: "🔧" },
    { id: "audit", label: "Audit & Reconciliation", icon: "🛡️" },
    { id: "reports", label: "Analytics & Reports", icon: "📈" },
    { id: "notifications", label: "Notifications Feed", icon: "🔔" },
  ];

  const currentNav = navItems.find((n) => n.id === currentScreen) || navItems[0];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Premium Enterprise Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col flex-shrink-0 shadow-2xl z-20 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-sm tracking-wider shadow-md">
              AF
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block">AssetFlow</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Enterprise ERP</span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
            v1.0
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Core Modules</p>
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? "bg-slate-800 text-white shadow-md border border-slate-700/60"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active User Card & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                AP
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">Arthur Pendelton</p>
                <p className="text-[10px] text-slate-400 mt-1">Role: ADMIN</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentScreen("login")}
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-slate-800 flex items-center justify-center space-x-2"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Enterprise Top Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enterprise Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AssetFlow ERP</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-800">{currentNav.label}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend API Connected (:3005)</span>
            </div>

            <button
              onClick={() => setCurrentScreen("assets")}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              + Quick Register
            </button>
          </div>
        </header>

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {currentScreen === "dashboard" && <Screen2Overview />}
          {currentScreen === "orgsetup" && <Screen3OrgSetup />}
          {currentScreen === "assets" && <Screen4AssetDir />}
          {currentScreen === "allocation" && <Screen5Transfer />}
          {currentScreen === "booking" && <Screen6Booking />}
          {currentScreen === "maintenance" && <Screen7Kanban />}
          {currentScreen === "audit" && <Screen8Audit />}
          {currentScreen === "reports" && <Screen9Reports />}
          {currentScreen === "notifications" && <Screen10Notifications />}
        </main>
      </div>
    </div>
  );
}