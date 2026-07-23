import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL } from '../config';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

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
        <div className="w-full h-[160px] bg-[#fceeea]">
          <img 
            src="https://assets.myntassets.com/f_webp,dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2023/10/29/9610ca31-f10f-488d-8a03-722a4d3ee12d1698606409028-Flat_200--1-.jpg" 
            alt="Login Banner" 
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
            
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full border border-[#d4d5d9] px-3 py-2 outline-none text-[14px] text-[#282c3f] focus:border-[#282c3f] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

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
