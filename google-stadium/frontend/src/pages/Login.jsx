import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
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

      const apiUrl = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";
      console.log(`[AUTH] Step 3: Sending request to ${apiUrl}/auth/login`);
      const response = await fetch(`${apiUrl}/auth/login`, {
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

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential
      });
      login(res.data.access_token);
      navigate('/fan-dashboard');
    } catch (err) {
      console.error("Google login failed", err);
      setErrorMessage("Sign in with Google failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 md:p-10 rounded-3xl shadow-xl border border-gray-300 dark:border-gray-700">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-black bg-gradient-to-r from-googleBlue to-googleGreen bg-clip-text text-transparent mb-2">Google Stadium</h1>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Sign In</h2>
        </div>
        
        {error && (
          <div className="p-4 mb-6 text-sm font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/50 rounded-xl animate-shake">
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Username</label>
            <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-googleBlue transition-all shadow-inner placeholder:text-gray-400" placeholder="Enter username" aria-label="Username or email" />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-googleBlue transition-all shadow-inner placeholder:text-gray-400" placeholder="••••••••" aria-label="Password" />
          </div>
          
          <button type="submit" disabled={isLoading} className={`w-full py-4 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-googleBlue hover:bg-blue-600'} text-white font-black rounded-xl shadow-lg shadow-googleBlue/20 transition-all active:scale-95 mt-4 flex items-center justify-center whitespace-nowrap uppercase tracking-widest text-sm`} aria-label="Sign In to your account">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Sign In'}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700 font-bold"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700 font-bold"></div>
          </div>

          <div className="flex justify-center mt-2">
            <GoogleLogin 
              onSuccess={onGoogleSuccess}
              onError={() => setErrorMessage("Google Sign-In was unsuccessful.")}
              useOneTap
              theme="outline"
              size="large"
              shape="pill"
              width="250"
            />
          </div>
        </form>
        
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              New to the platform? <Link to="/register" className="text-googleBlue hover:underline font-bold" aria-label="Create a new account">Create an account</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
