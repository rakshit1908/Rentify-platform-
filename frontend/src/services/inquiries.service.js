import api from './api';

export const createInquiry        = (data)           => api.post('/inquiries', data);
export const fetchMyInquiries     = ()               => api.get('/inquiries/my');
export const fetchOwnerInquiries  = (params = {})    => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v)
  ).toString();
  return api.get(`/inquiries/owner${qs ? `?${qs}` : ''}`);
};
export const fetchInquiryStats    = ()               => api.get('/inquiries/stats');
export const updateInquiryStatus  = (id, status)     => api.patch(`/inquiries/${id}/status`, { status });
