"use client";

export default function Screen3OrgSetup() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Organization setup (Admin only)</h1>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium">Departments</button>
        <button className="border border-slate-300 bg-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors">Categories</button>
        <button className="border border-slate-300 bg-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors">Employee</button>
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium ml-auto">+ Add</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 font-semibold text-slate-600 text-sm">Department</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Head</th>
              <th className="p-5 font-semibold text-slate-600 text-sm">Parent Dept</th>
              <th className="p-5 font-semibold text-slate-600 text-sm text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="p-5 font-medium text-slate-800">Engineering</td>
              <td className="p-5 text-slate-600">aditi rao</td>
              <td className="p-5 text-slate-600">--</td>
              <td className="p-5 text-right">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white">Active</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="p-5 font-medium text-slate-800">Facilities</td>
              <td className="p-5 text-slate-600">rohan mehta</td>
              <td className="p-5 text-slate-600">--</td>
              <td className="p-5 text-right">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white">Active</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="p-5 font-medium text-slate-800">Field ops (east)</td>
              <td className="p-5 text-slate-600">sana iqbal</td>
              <td className="p-5 text-slate-600">Field Ops</td>
              <td className="p-5 text-right">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-300 text-slate-700">Inactive</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p className="text-slate-500 text-sm italic">Editing a department here also drives the picklist in Screen 4 & 5</p>
    </div>
  );
}
