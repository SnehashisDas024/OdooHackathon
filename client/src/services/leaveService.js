import api from './api';

export const leaveService = {
  // GET /api/v1/leave/balance
  getBalances: () => api.get('/leave/balance'),
  // POST /api/v1/leave — multipart/form-data (optional file attachment)
  apply: (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v != null) form.append(k, v);
    });
    return api.post('/leave', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  // GET /api/v1/leave/me — Employee: own requests
  getOwn: (params) => api.get('/leave/me', { params }),
  // GET /api/v1/leave — Admin: all requests
  getAll: (params) => api.get('/leave', { params }),
  // PATCH /api/v1/leave/:id/decision — Admin: approve or reject
  approve: (id, comment) =>
    api.patch(`/leave/${id}/decision`, { status: 'APPROVED', adminComment: comment }),
  reject: (id, comment) =>
    api.patch(`/leave/${id}/decision`, { status: 'REJECTED', adminComment: comment }),
};
