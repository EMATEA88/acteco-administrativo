import { api } from '../services/api'

export const KYCService = {

  // ADMIN
  list: (page = 1) =>
    api.get(`/admin/kyc?page=${page}`),

  approve: (userId: number) =>
    api.patch(`/admin/kyc/${userId}/approve`),

  reject: (userId: number, reason: string) =>
    api.patch(`/admin/kyc/${userId}/reject`, { reason }),

  // USER
  submit: (data: any) =>
    api.post('/kyc/submit', data),

  status: () =>
    api.get('/kyc/status')

}
