"use client";

export default function Screen9Reports() {
  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Reports Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bar Chart Placeholder */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Utilization by Department</h2>
          <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-end justify-around p-6 pt-12 relative overflow-hidden">
            
            {/* Grid lines */}
            <div className="absolute w-full border-t border-slate-200 top-1/4"></div>
            <div className="absolute w-full border-t border-slate-200 top-2/4"></div>
            <div className="absolute w-full border-t border-slate-200 top-3/4"></div>

            {/* Bars */}
            <div className="w-20 bg-blue-500 rounded-t-lg h-[80%] flex items-start pt-3 justify-center text-xs text-white font-bold shadow-md z-10 transition-all hover:opacity-90 cursor-pointer">IT</div>
            <div className="w-20 bg-emerald-500 rounded-t-lg h-[60%] flex items-start pt-3 justify-center text-xs text-white font-bold shadow-md z-10 transition-all hover:opacity-90 cursor-pointer">HR</div>
            <div className="w-20 bg-amber-500 rounded-t-lg h-[95%] flex items-start pt-3 justify-center text-xs text-white font-bold shadow-md z-10 transition-all hover:opacity-90 cursor-pointer">Eng</div>
            <div className="w-20 bg-purple-500 rounded-t-lg h-[40%] flex items-start pt-3 justify-center text-xs text-white font-bold shadow-md z-10 transition-all hover:opacity-90 cursor-pointer">Sales</div>
          </div>
        </div>

        {/* Line Chart Placeholder */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Maintenance Frequency</h2>
          <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center relative p-6">
            
            {/* Grid lines */}
            <div className="absolute w-full border-t border-slate-200 top-1/4"></div>
            <div className="absolute w-full border-t border-slate-200 top-2/4"></div>
            <div className="absolute w-full border-t border-slate-200 top-3/4"></div>

            <svg className="w-full h-full text-slate-300 z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Data line */}
              <polyline points="0,80 20,60 40,70 60,20 80,40 100,10" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {/* Data points */}
              <circle cx="0" cy="80" r="3" fill="#4f46e5" />
              <circle cx="20" cy="60" r="3" fill="#4f46e5" />
              <circle cx="40" cy="70" r="3" fill="#4f46e5" />
              <circle cx="60" cy="20" r="3" fill="#4f46e5" />
              <circle cx="80" cy="40" r="3" fill="#4f46e5" />
              <circle cx="100" cy="10" r="3" fill="#4f46e5" />
            </svg>
            <span className="absolute text-slate-500 font-semibold bg-white/80 px-3 py-1 rounded-md z-20 backdrop-blur-sm shadow-sm border border-slate-200">Interactive Line Chart Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
