import { createContext, useContext, useState, useMemo } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = useMemo(() => ({
    employees,
    setEmployees,
    loading,
    setLoading,
    error,
    setError,
    addEmployeeState: (newEmp) => setEmployees(prev => [newEmp, ...prev]),
    updateEmployeeState: (updatedEmp) => setEmployees(prev => 
      prev.map(emp => emp.id === updatedEmp.id ? updatedEmp : emp)
    ),
  }), [employees, loading, error]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);