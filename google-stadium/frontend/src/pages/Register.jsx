import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const API = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fan');
  const [storeName, setStoreName] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const payload = {
        username,
        email,
        password,
        role,
        ...(role === 'vendor' && storeName ? { store_name: storeName } : {}),
        ...(role === 'admin' && adminSecret ? { admin_secret: adminSecret } : {})
      };

      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Registration failed (${response.status})`);
      }
      
      const data = await response.json();
      
      // Auto-login: save the access_token from registration response
      if (data.access_token) {
        login(data.access_token);
        localStorage.setItem("token", data.access_token);
        
        // Route to the correct dashboard based on role
        if (role === 'vendor') navigate('/vendor-dashboard');
        else if (role === 'admin') navigate('/admin-dashboard');
        else navigate('/fan-dashboard');
      } else {
        // Fallback: redirect to login if no token returned
        navigate('/login');
      }
    } catch (err) {
      console.error("[AUTH] ERROR CAUGHT:", err);
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-800">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-black bg-gradient-to-r from-googleBlue to-googleGreen bg-clip-text text-transparent mb-2">Google Stadium</h1>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Join the Platform</h2>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/50 rounded-xl animate-shake">
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-googleBlue transition-all shadow-inner" placeholder="johndoe" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-googleBlue transition-all shadow-inner" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Secure Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-googleBlue transition-all shadow-inner" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Your Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-googleBlue transition-all appearance-none cursor-pointer">
                <option value="fan">Fan (Attendee)</option>
                <option value="vendor">Stadium Vendor</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
            
            {role === 'vendor' && (
              <div className="animate-fade-in-up">
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest text-googleBlue">Business Name</label>
                <input type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-googleBlue/5 border-2 border-googleBlue/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-googleBlue transition-all" placeholder="The Stadium Grill" />
              </div>
            )}
            
            {role === 'admin' && (
              <div className="animate-fade-in-up">
                <label className="block text-xs font-black text-amber-600 mb-2 uppercase tracking-widest">🔒 Secret Auth Code</label>
                <input type="password" required value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full bg-amber-500/5 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-mono" placeholder="Internal Code" />
                <p className="text-[10px] text-amber-600 font-bold mt-2 uppercase tracking-wider">Required for administrative privileges.</p>
              </div>
            )}
          </div>
          
          <button type="submit" disabled={isLoading} className={`w-full py-4 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-googleGreen hover:bg-green-600'} text-white font-black rounded-xl shadow-lg shadow-googleGreen/20 transition-all active:scale-95 mt-4 flex items-center justify-center whitespace-nowrap uppercase tracking-widest text-sm`}>
            {isLoading ? (
               <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Creating...
               </>
            ) : 'Sign Up Now'}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Already have an account? <Link to="/login" className="text-googleBlue hover:underline font-bold">Sign In instead</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
