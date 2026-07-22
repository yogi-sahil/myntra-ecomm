import { createContext, useContext } from 'react';

export const AdminToastContext = createContext(null);

export const useAdminToast = () => {
  const context = useContext(AdminToastContext);
  if (!context) throw new Error('useAdminToast must be used inside AdminToastProvider');
  return context;
};

