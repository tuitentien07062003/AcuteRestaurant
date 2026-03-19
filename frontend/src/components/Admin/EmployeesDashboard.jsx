// src/pages/Admin/EmployeesDashboard.jsx
import { useState } from 'react';
import { useAdminData } from "@/hooks/useAdmin";
import useInit from "@/hooks/useInit";
import { initAdminEmployees } from "@/init/employeeInit";

import EmployeesStats from "./EmployeesStats";
import EmployeesTable from "./EmployeesTable";
import EmployeeAddDialog from "./EmployeeAddDialog";
import EmployeeEditDialog from "./EmployeeEditDialog";
import EmployeeDetailDialog from "./EmployeeDetailDialog";

const EmployeesDashboard = () => {
  const ctx = useAdminData();
  const { toggleEmployeeActive } = ctx;
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Khởi tạo dữ liệu minh bạch theo phong cách POS
  useInit(() => {
    initAdminEmployees(ctx);
  }, []);

  const handleEditClick = (emp) => {
    setSelectedEmployee(emp);
    setEditDialogOpen(true);
  };

  const handleDetailClick = (emp) => {
    setSelectedEmployee(emp);
    setDetailDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Stats */}
      <EmployeesStats onAddClick={() => setAddDialogOpen(true)} />
      
      {/* Table - Truyền data rõ ràng */}
      <EmployeesTable 
        onEditClick={handleEditClick}
        onDetailClick={handleDetailClick}
        onToggleActive={(emp) => toggleEmployeeActive(emp.id, !emp.active)}
      />

      {/* Dialogs */}
      <EmployeeAddDialog 
        isOpen={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)} 
      />
      {selectedEmployee && (
        <>
          <EmployeeEditDialog 
            employee={selectedEmployee}
            isOpen={editDialogOpen} 
            onClose={() => setEditDialogOpen(false)} 
          />
          <EmployeeDetailDialog 
            employee={selectedEmployee}
            isOpen={detailDialogOpen} 
            onClose={() => setDetailDialogOpen(false)}
            onEdit={handleEditClick}
          />
        </>
      )}
    </div>
  );
};

export default EmployeesDashboard;