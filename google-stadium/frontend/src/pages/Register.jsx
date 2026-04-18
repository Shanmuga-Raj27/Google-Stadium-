import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('fan');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[AUTH] Step 1: Form submitted. Preventing default.");
    setError("");
    setIsLoading(true);
    
    try {
      console.log("[AUTH] Step 2: Preparing registration payload.");
      const payload = {
        username,
        email,
        password,
        role,
        ...(role === 'vendor' && storeName ? { store_name: storeName } : {})
      };

      console.log("[AUTH] Step 3: Sending native fetch to http://127.0.0.1:8000/auth/register");
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      console.log("[AUTH] Step 4: Registration successful!");
      setSuccess(true);
      setTimeout(() => {
        console.log("[AUTH] Step 5: Navigating to login...");
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error("[AUTH] ERROR CAUGHT:", err);
      setError(err.message || "Unable to connect to the server. Check backend.");
    } finally {
      console.log("[AUTH] Step 6: Finally block running. Resetting loading state.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-semibold text-white mb-6 text-center">Create Account</h2>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg animate-shake">
            {error}
          </div>
        )}
        {success ? (
          <div className="p-4 bg-emerald-900/50 border border-emerald-500 text-emerald-300 rounded-lg text-center font-medium">
            Account created! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Account Type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="fan">Fan (Attendee)</option>
                <option value="vendor">Stadium Vendor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {role === 'vendor' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Store Name</label>
                <input type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
            )}
            <button type="submit" disabled={isLoading} className={`w-full py-3 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-googleGreen hover:bg-googleGreen/90'} text-white font-bold rounded-lg shadow-lg transition active:scale-95 mt-4 flex items-center justify-center whitespace-nowrap`}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Sign Up'}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
