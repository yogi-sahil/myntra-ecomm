import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bannerSrc, setBannerSrc] = useState('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const bodyData = isLogin 
      ? { email, password } 
      : { name, email, mobile, password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#fceeea] flex justify-center items-start">
      <div className="bg-white w-[400px] mt-10 shadow-sm flex flex-col">
        {/* Banner Image */}
        <div className="w-full h-[160px] bg-[#fceeea] relative overflow-hidden">
          <img 
            src={bannerSrc} 
            alt="Login Banner" 
            onError={() => setBannerSrc('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80')}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-[20px] font-bold text-[#282c3f] mb-6">
            {isLogin ? 'Login' : 'Signup'} <span className="font-normal text-[16px]">to your account</span>
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  className="w-full border border-[#d4d5d9] px-3 py-2 outline-none text-[14px] text-[#282c3f] focus:border-[#282c3f] transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Mobile Number" 
                  required
                  className="w-full border border-[#d4d5d9] px-3 py-2 outline-none text-[14px] text-[#282c3f] focus:border-[#282c3f] transition-colors"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </>
            )}

            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full border border-[#d4d5d9] px-3 py-2 outline-none text-[14px] text-[#282c3f] focus:border-[#282c3f] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                required
                className="w-full border border-[#d4d5d9] px-3 py-2 pr-10 outline-none text-[14px] text-[#282c3f] focus:border-[#282c3f] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ff3f6c] transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.122-.163c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.092-4.092a3 3 0 11-4.243-4.243M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {error && <p className="text-[#ff3f6c] text-[12px]">{error}</p>}

            <p className="text-[12px] text-[#282c3f] mb-2 mt-2">
              By continuing, I agree to the <span className="text-[#ff3f6c] font-bold cursor-pointer">Terms of Use</span> & <span className="text-[#ff3f6c] font-bold cursor-pointer">Privacy Policy</span>
            </p>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff3f6c] text-white font-bold py-3 text-[14px] mb-4 hover:bg-[#e11b4c] transition-colors disabled:opacity-70"
            >
              {isLoading ? 'PLEASE WAIT...' : 'CONTINUE'}
            </button>
          </form>

          <p className="text-[14px] text-[#282c3f] text-center">
            {isLogin ? "New to Myntra? " : "Already have an account? "}
            <span 
              className="text-[#ff3f6c] font-bold cursor-pointer"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Create an account' : 'Log in here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
