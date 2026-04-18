import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[AUTH] Step 1: Form submitted. Preventing default.");
    setError("");
    setIsLoading(true);
    
    try {
      console.log("[AUTH] Step 2: Preparing payload.");
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      console.log("[AUTH] Step 3: Sending native fetch to http://127.0.0.1:8000/auth/login");
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("[AUTH] Step 4: Response received!", response.status);
      
      login(data.access_token);
      localStorage.setItem("token", data.access_token);
      
      console.log("[AUTH] Step 5: Decoding token and navigating...");
      const base64Url = data.access_token.split('.')[1];
      const jsonPayload = decodeURIComponent(atob(base64Url.replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      if (payload.role === 'vendor') navigate('/vendor-dashboard');
      else if (payload.role === 'admin') navigate('/admin-dashboard');
      else navigate('/fan-dashboard');
    } catch (err) {
      console.error("[AUTH] ERROR CAUGHT:", err);
      setError(err.message || "Unable to connect to the server. Check backend.");
    } finally {
      console.log("[AUTH] Step 6: Finally block running. Resetting loading state.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-semibold text-white mb-6 text-center">Sign In</h2>
        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg animate-shake">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <button type="submit" disabled={isLoading} className={`w-full py-3 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-googleBlue hover:bg-googleBlue/90'} text-white font-bold rounded-lg shadow-lg transition active:scale-95 mt-4 flex items-center justify-center whitespace-nowrap`}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
}
