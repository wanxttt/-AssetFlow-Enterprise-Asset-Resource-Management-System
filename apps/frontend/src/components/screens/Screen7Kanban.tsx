"use client";
import { useState } from "react";

const STAGES = ["Pending", "Approved", "Technician Assigned", "In Progress", "Resolved"];

export default function Screen7Kanban() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "AC Repair (Floor 2)", stage: "Pending" },
    { id: 2, title: "Projector Bulb Replacement", stage: "Approved" },
    { id: 3, title: "Network Router Restart", stage: "Technician Assigned" },
  ]);

  const moveTask = (taskId: number, currentStage: string) => {
    const currentIndex = STAGES.indexOf(currentStage);
    if (currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      setTasks(tasks.map(t => t.id === taskId ? { ...t, stage: nextStage } : t));
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-2xl font-semibold text-slate-800 mb-8">Maintenance Kanban</h1>
      
      <div className="flex space-x-6 overflow-x-auto pb-6 flex-1 items-start">
        {STAGES.map(stage => (
          <div key={stage} className="min-w-[300px] w-[300px] bg-slate-100 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-5 px-1">
              <h2 className="font-semibold text-slate-700 text-sm">{stage}</h2>
              <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.stage === stage).length}
              </span>
            </div>
            <div className="space-y-4 flex-1">
              {tasks.filter(t => t.stage === stage).map(task => (
                <div key={task.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 cursor-grab hover:shadow-md transition-shadow">
                  <p className="font-medium text-slate-800 mb-4 text-sm leading-snug">{task.title}</p>
                  {stage !== "Resolved" && (
                    <button 
                      onClick={() => moveTask(task.id, task.stage)}
                      className="w-full text-xs font-semibold bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      {stage === "Pending" ? "Approve" : "Move to " + STAGES[STAGES.indexOf(stage) + 1]}
                    </button>
                  )}
                  {stage === "Resolved" && (
                    <span className="w-full flex justify-center items-center px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Completed
                    </span>
                  )}
                </div>
              ))}
              {tasks.filter(t => t.stage === stage).length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
