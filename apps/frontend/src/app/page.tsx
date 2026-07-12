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
  const [currentScreen, setCurrentScreen] = useState("login");

  if (currentScreen === "login") {
    return <Screen1Login onLogin={() => setCurrentScreen("dashboard")} />;
  }

  const NavItem = ({ id, label }: { id: string, label: string }) => (
    <div 
      onClick={() => setCurrentScreen(id)}
      className={`block px-4 py-3 rounded-xl cursor-pointer transition-all text-sm font-medium ${
        currentScreen === id 
          ? "bg-slate-800 text-white shadow-inner" 
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {label}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col flex-shrink-0 shadow-xl z-10">
        <div className="p-8 text-2xl font-bold border-b border-slate-800/50 flex items-center">
          <div className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center text-sm mr-4 tracking-wider">AF</div>
          AssetFlow
        </div>
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
          <NavItem id="dashboard" label="Dashboard" />
          <NavItem id="orgsetup" label="Organization setup" />
          <NavItem id="assets" label="Assets" />
          <NavItem id="allocation" label="Allocation & Transfer" />
          <NavItem id="booking" label="Resource Booking" />
          <NavItem id="maintenance" label="Maintenance" />
          <NavItem id="audit" label="Audit" />
          <NavItem id="reports" label="Reports" />
          <NavItem id="notifications" label="Notifications" />
        </nav>
        <div className="p-5 border-t border-slate-800/50">
          <button 
            onClick={() => setCurrentScreen("login")}
            className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
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
  );
}