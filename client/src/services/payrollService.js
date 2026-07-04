import api from './api';

export const payrollService = {
  // GET /api/v1/payroll/me — Employee: own payslip
  getOwn: () => api.get('/payroll/me'),
  // GET /api/v1/payroll/:employeeId — Admin: specific employee
  getByEmployee: (id) => api.get(`/payroll/${id}`),
  // PUT /api/v1/payroll/:employeeId — Admin: update salary
  update: (id, data) => api.put(`/payroll/${id}`, data),
};
