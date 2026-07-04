import api from './api';

export const attendanceService = {
  // POST /api/v1/attendance/check-in
  checkIn: () => api.post('/attendance/check-in'),
  // POST /api/v1/attendance/check-out
  checkOut: () => api.post('/attendance/check-out'),
  // GET /api/v1/attendance/me?month=YYYY-MM
  getOwn: (params) => api.get('/attendance/me', { params }),
  // GET /api/v1/attendance/today — Admin: all employees today
  getAll: (params) => api.get('/attendance/today', { params }),
  // GET /api/v1/attendance/today-status — Employee: own today
  getTodayStatus: () => api.get('/attendance/today-status'),
  // GET /api/v1/attendance/:employeeId — Admin: specific employee
  getByEmployee: (employeeId, params) => api.get(`/attendance/${employeeId}`, { params }),
};
