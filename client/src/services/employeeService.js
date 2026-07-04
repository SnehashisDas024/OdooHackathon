import api from './api';

export const employeeService = {
  // GET /api/v1/employees — Admin: list all
  getAll: (params) => api.get('/employees', { params }),
  // GET /api/v1/employees/me — Own profile
  getMe: () => api.get('/employees/me'),
  // GET /api/v1/employees/:id — Admin: specific employee
  getById: (id) => api.get(`/employees/${id}`),
  // PATCH /api/v1/employees/me — Employee: update own fields
  updateMe: (data) => api.patch('/employees/me', data),
  // PATCH /api/v1/employees/:id — Admin: update any employee
  update: (id, data) => api.patch(`/employees/${id}`, data),
  // POST /api/v1/employees — Admin: create employee
  create: (data) => api.post('/employees', data),
  // POST /api/v1/employees/:id/documents/profile-picture
  uploadAvatar: (id, formData) =>
    api.post(`/employees/${id}/documents/profile-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Skills
  addSkill: (id, name) => api.post(`/employees/${id}/skills`, { name }),
  removeSkill: (id, skillId) => api.delete(`/employees/${id}/skills/${skillId}`),
  // Certifications
  addCertification: (id, data) => api.post(`/employees/${id}/certifications`, data),
  removeCertification: (id, certId) => api.delete(`/employees/${id}/certifications/${certId}`),
};
