import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'EMPLOYEE' | 'AGENT';

interface RoleContextProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Khôi phục role từ localStorage nếu có, mặc định là EMPLOYEE
  const [currentRole, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem('user_role') as Role) || 'EMPLOYEE';
  });

  const setCurrentRole = (role: Role) => {
    localStorage.setItem('user_role', role);
    setRoleState(role);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
