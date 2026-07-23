import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Animated Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-2xl transition-all duration-300 transform translate-y-0 animate-bounce bg-[#282c3f] text-white border-l-4 border-[#ff3f6c]">
          <span className={`w-3 h-3 rounded-full ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#03a685]'}`} />
          <p className="text-[14px] font-bold tracking-wide">{toast.message}</p>
        </div>
      )}
    </ToastContext.Provider>
  );
};
