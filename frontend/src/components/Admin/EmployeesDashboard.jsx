import { useState } from "react";
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Stats */}
      <EmployeesStats onAddClick={() => setAddDialogOpen(true)} />

      {/* Table */}
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
