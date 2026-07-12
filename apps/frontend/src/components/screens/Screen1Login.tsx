"use client";

export default function Screen1Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex h-screen bg-slate-900 text-white items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-black/40 border border-slate-700 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 border border-slate-500 rounded-full flex items-center justify-center text-2xl font-light tracking-wider">
            AF
          </div>
        </div>
        <h2 className="text-center text-xl font-medium mb-8">AssetFlow – login</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              className="w-full bg-transparent border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-emerald-500 transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="********" 
              className="w-full bg-transparent border border-slate-600 rounded-xl p-3 text-white outline-none focus:border-emerald-500 transition-colors" 
            />
            <div className="text-right mt-2">
              <span className="text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">Forgot password</span>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-6 mt-8">
            <h3 className="text-sm text-slate-300 mb-3">New here?</h3>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm mb-6 text-slate-300">
              Sign up creates an employee account<br/>admin roles assigned later
            </div>
            <button 
              onClick={() => {
                console.log("Clicked");
                onLogin();
              }} 
              className="w-full border border-slate-500 rounded-xl py-3 hover:bg-white hover:text-black hover:border-white transition-all font-medium"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
