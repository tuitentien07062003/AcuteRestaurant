import { Employee } from '../models/Employee.js';

// Allowed roles
const ROLES = {
  ADMIN_ROLES: ['SM', 'SUP'],
  EMPLOYEE_ROLES: ['CREW', 'CREW_TRAINER', 'CREW_LEADER']
};

/**
 * Middleware kiểm tra role
 * @param {Array} roles - Allowed roles array
 */
export const authorizeRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const employee = await Employee.findByPk(userId, {
        attributes: ['role']
      });

      if (!employee || !roles.includes(employee.role)) {
        return res.status(403).json({ 
          message: `Yêu cầu role: ${roles.join(', ')}. Role hiện tại: ${employee?.role || 'none'}` 
        });
      }

      req.user.role = employee.role; // Attach to req
      next();
    } catch (error) {
      console.error('Auth role error:', error);
      res.status(500).json({ message: 'Role check error' });
    }
  };
};

// Convenience middlewares
export const adminOnly = authorizeRole(['SM']);
export const adminOrManager = authorizeRole(['SUP', 'SM']);
export const employeeOnly = authorizeRole(['CREW', 'CREW_TRAINER', 'CREW_LEADER']);

