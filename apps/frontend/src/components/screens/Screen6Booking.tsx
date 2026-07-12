"use client";

export default function Screen6Booking() {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Resource Booking</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Conference Room A - Today</h2>
        
        <div className="relative h-64 border-l border-b border-slate-200 mb-6">
          {/* Time axis markers */}
          <div className="absolute left-0 -ml-16 top-0 text-xs text-slate-500 font-medium">9:00 AM</div>
          <div className="absolute left-0 -ml-16 top-1/4 text-xs text-slate-500 font-medium">9:30 AM</div>
          <div className="absolute left-0 -ml-16 top-2/4 text-xs text-slate-500 font-medium">10:00 AM</div>
          <div className="absolute left-0 -ml-16 top-3/4 text-xs text-slate-500 font-medium">10:30 AM</div>
          
          {/* Horizontal grid lines */}
          <div className="absolute w-full border-t border-slate-100 top-0"></div>
          <div className="absolute w-full border-t border-slate-100 top-1/4"></div>
          <div className="absolute w-full border-t border-slate-200 top-2/4"></div>
          <div className="absolute w-full border-t border-slate-100 top-3/4"></div>

          {/* Booked Slot (9:00 - 10:00) */}
          <div className="absolute top-0 left-4 w-1/3 h-2/4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-4 opacity-90 shadow-sm z-10 transition-transform hover:scale-[1.02] cursor-pointer">
            <p className="text-sm font-bold text-emerald-900">Team Sync</p>
            <p className="text-xs text-emerald-700 mt-1">Aditi Rao</p>
          </div>

          {/* Conflict Slot (9:30 - 10:30) */}
          <div className="absolute top-1/4 left-[35%] w-1/3 h-2/4 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 opacity-90 shadow-lg z-20 transition-transform hover:scale-[1.02] cursor-pointer">
            <p className="text-sm font-bold text-red-900">Client Call</p>
            <p className="text-xs text-red-700 mt-1">Rohan Mehta</p>
            <div className="text-[10px] font-bold text-red-900 mt-2 flex items-center bg-red-100 w-fit px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse"></span> CONFLICT
            </div>
          </div>
        </div>

        <div className="bg-red-900/10 text-red-800 p-5 rounded-xl border border-red-900/20 text-sm">
          <strong className="font-semibold block mb-1">Booking Conflict Detected:</strong> 
          "Client Call" overlaps with "Team Sync" from <span className="font-medium">9:30 AM to 10:00 AM</span>.
        </div>
      </div>
    </div>
  );
}
