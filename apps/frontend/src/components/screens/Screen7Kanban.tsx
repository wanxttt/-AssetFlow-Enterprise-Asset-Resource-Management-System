"use client";
import { useState, useEffect } from "react";

const STAGES = ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"];

export default function Screen7Kanban() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { "x-user-role": "ADMIN" };
      const [maintRes, assetsRes] = await Promise.all([
        fetch("http://localhost:3005/api/maintenance", { headers }),
        fetch("http://localhost:3005/api/assets", { headers })
      ]);
      if (maintRes.ok) setTasks(await maintRes.json());
      if (assetsRes.ok) {
        const aData = await assetsRes.json();
        setAssets(Array.isArray(aData) ? aData : []);
      }
    } catch (err) {
      console.error("Failed to fetch maintenance tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const moveTask = async (taskId: string, currentStage: string) => {
    setBannerMsg(null);
    try {
      if (currentStage === "PENDING") {
        const res = await fetch(`http://localhost:3005/api/maintenance/${taskId}/approve`, {
          method: "PATCH",
          headers: { "x-user-role": "ADMIN" },
        });
        if (res.ok) {
          setBannerMsg("Maintenance request approved & budget authorized.");
          await fetchData();
        } else {
          setBannerMsg(`Approval failed (${res.status}): ${await res.text()}`);
        }
      } else {
        const currentIndex = STAGES.indexOf(currentStage);
        if (currentIndex < STAGES.length - 1) {
          const nextStage = STAGES[currentIndex + 1];
          const res = await fetch(`http://localhost:3005/api/maintenance/${taskId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": "ADMIN",
            },
            body: JSON.stringify({ status: nextStage }),
          });
          if (res.ok) {
            setBannerMsg(`Task advanced to stage: ${nextStage}`);
            await fetchData();
          } else {
            setBannerMsg(`Transition failed (${res.status}): ${await res.text()}`);
          }
        }
      }
    } catch (err: any) {
      setBannerMsg(`Network Error: ${err?.message || err}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !selectedAssetId) return;

    try {
      const res = await fetch("http://localhost:3005/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "ADMIN"
        },
        body: JSON.stringify({
          assetId: selectedAssetId,
          description: `[${priority}] ${description.trim()}`,
          cost: 450
        })
      });

      if (res.ok) {
        setBannerMsg("New repair order dispatched to PENDING board.");
        setDescription("");
        setShowModal(false);
        await fetchData();
      } else {
        setBannerMsg(`Error (${res.status}): ${await res.text()}`);
      }
    } catch (err: any) {
      setBannerMsg(`Error: ${err?.message || err}`);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "PENDING": return "border-t-amber-500 bg-amber-500/10 text-amber-900";
      case "APPROVED": return "border-t-blue-500 bg-blue-500/10 text-blue-900";
      case "TECHNICIAN_ASSIGNED": return "border-t-purple-500 bg-purple-500/10 text-purple-900";
      case "IN_PROGRESS": return "border-t-indigo-500 bg-indigo-500/10 text-indigo-900";
      case "RESOLVED": return "border-t-emerald-500 bg-emerald-500/10 text-emerald-900";
      default: return "border-t-slate-400";
    }
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            MAINTENANCE & FLEET REPAIR
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">Active Maintenance Kanban</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time work order triage, SLA stage progression, and expense approval board</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
          >
            <span>+ Create Repair Order</span>
          </button>
          <button
            onClick={fetchData}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Refresh Board
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="mb-6 p-4 bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center justify-between shadow-md">
          <span>🔔 {bannerMsg}</span>
          <button onClick={() => setBannerMsg(null)} className="font-bold text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="flex space-x-5 overflow-x-auto pb-6 flex-1 items-start">
        {STAGES.map(stage => {
          const stageTasks = tasks.filter(t => t.status === stage);
          return (
            <div
              key={stage}
              className="min-w-[280px] w-[280px] bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col shadow-sm border-t-4"
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="font-bold text-slate-800 text-xs tracking-wider uppercase">{stage.replace("_", " ")}</span>
                <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  {stageTasks.length}
                </span>
              </div>

              <div className="space-y-3.5 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-xs text-slate-400 animate-pulse">Loading tickets...</div>
                ) : stageTasks.length > 0 ? (
                  stageTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/90 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {task.id?.slice(0, 8) || "WO-101"}
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          SLA ACTIVE
                        </span>
                      </div>

                      <p className="font-semibold text-slate-900 mb-3 text-xs leading-relaxed">{task.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 border-t border-slate-100 pt-2.5">
                        <span>Cost Est.</span>
                        <span className="font-bold text-slate-800">${task.cost || 450}</span>
                      </div>

                      {stage !== "RESOLVED" ? (
                        <button
                          onClick={() => moveTask(task.id, task.status)}
                          className="w-full text-xs font-semibold bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          {stage === "PENDING" ? "Authorize & Approve" : "Advance Stage →"}
                        </button>
                      ) : (
                        <div className="w-full text-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Service Completed
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                    No tasks in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Repair Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create New Repair Order</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Asset</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 outline-none"
                  required
                >
                  <option value="">Select Asset...</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.assetTag || "AF"} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 outline-none"
                >
                  <option value="CRITICAL">CRITICAL — Immediate Halt</option>
                  <option value="HIGH">HIGH — 24h SLA</option>
                  <option value="MEDIUM">MEDIUM — Routine Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Issue Description</label>
                <textarea
                  placeholder="E.g. Thermal throttling during GPU compute render workloads..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 outline-none h-24 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-sm"
                >
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
