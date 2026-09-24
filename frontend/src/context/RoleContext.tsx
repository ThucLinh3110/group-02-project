import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Role = 'EMPLOYEE' | 'AGENT';

interface RoleContextProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextProps | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mặc định là EMPLOYEE
  const [currentRole, setCurrentRole] = useState<Role>('EMPLOYEE');

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
