"use client";
import { useState, useEffect } from "react";

export default function Screen3OrgSetup() {
  const [activeTab, setActiveTab] = useState<"departments" | "employees">("departments");
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form states for Modal
  const [modalType, setModalType] = useState<"department" | "employee">("department");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("EMPLOYEE");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      const headers = { "x-user-role": "ADMIN" };
      const [deptsRes, usersRes] = await Promise.all([
        fetch("http://localhost:3005/api/org/departments", { headers }),
        fetch("http://localhost:3005/api/org/users", { headers })
      ]);
      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(Array.isArray(uData) ? uData : []);
      }
    } catch (err) {
      console.error("Failed to load org setup data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const headers = { "Content-Type": "application/json", "x-user-role": "ADMIN" };

      if (modalType === "department") {
        if (!newName.trim()) return;
        const res = await fetch("http://localhost:3005/api/org/departments", {
          method: "POST",
          headers,
          body: JSON.stringify({ name: newName.trim() })
        });
        if (res.ok) {
          setSuccessMsg(`Department "${newName}" created successfully.`);
          setNewName("");
          setShowModal(false);
          await fetchOrgData();
        } else {
          setErrorMsg(`Error (${res.status}): ${await res.text()}`);
        }
      } else {
        if (!newName.trim() || !newEmail.trim()) return;
        const res = await fetch("http://localhost:3005/api/org/users", {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: newName.trim(),
            email: newEmail.trim(),
            role: newRole,
            departmentId: selectedDeptId || (departments[0]?.id || null)
          })
        });
        if (res.ok) {
          setSuccessMsg(`Employee "${newName}" onboarded successfully.`);
          setNewName("");
          setNewEmail("");
          setShowModal(false);
          await fetchOrgData();
        } else {
          setErrorMsg(`Error (${res.status}): ${await res.text()}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(`Network Error: ${err?.message || err}`);
    }
  };

  const filteredDepartments = departments.filter((d: any) =>
    (d.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((u: any) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            ADMINISTRATION STUDIO
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">Organization & Hierarchy Setup</h1>
          <p className="text-slate-500 text-sm mt-1">Manage enterprise departments, employee identities, and role-based access controls</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setModalType(activeTab === "departments" ? "department" : "employee");
              setShowModal(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-2"
          >
            <span>+ Add {activeTab === "departments" ? "Department" : "Employee"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex space-x-2 bg-slate-200/60 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "departments"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "employees"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Employee Directory ({users.length})
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-800 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === "departments" ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Department Name</th>
                <th className="p-4">Assigned Head</th>
                <th className="p-4">Parent Dept</th>
                <th className="p-4">Members</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Loading departments from Postgres...</td>
                </tr>
              ) : filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept: any) => (
                  <tr key={dept.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-900">{dept.name}</td>
                    <td className="p-4 text-slate-600">
                      {dept.head?.name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-4 text-slate-500">{dept.parent?.name || "Corporate HQ"}</td>
                    <td className="p-4 text-slate-600">
                      {users.filter(u => u.departmentId === dept.id).length} Active
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">No departments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Department</th>
                <th className="p-4">Access Role</th>
                <th className="p-4 pr-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">Loading employee directory...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-900 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                        {u.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4 text-slate-600">{u.department?.name || "Unassigned"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.role === "ADMIN" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                        u.role === "ASSET_MANAGER" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {modalType === "department" ? "Create New Department" : "Onboard New Employee"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateEntity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {modalType === "department" ? "Department Name" : "Full Name"}
                </label>
                <input
                  type="text"
                  placeholder={modalType === "department" ? "E.g. Procurement & Supply Chain" : "E.g. Samantha Vance"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-800"
                  required
                />
              </div>

              {modalType === "employee" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="E.g. samantha@assetflow.io"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Role</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 outline-none"
                      >
                        <option value="EMPLOYEE">EMPLOYEE</option>
                        <option value="DEPARTMENT_HEAD">DEPT HEAD</option>
                        <option value="ASSET_MANAGER">ASSET MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Department</label>
                      <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-900 outline-none"
                      >
                        <option value="">Select Dept...</option>
                        {departments.map((d: any) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

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
                  {modalType === "department" ? "Create Department" : "Onboard Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
