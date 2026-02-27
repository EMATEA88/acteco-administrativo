import { api } from './api'

export interface AdminFinanceOverview {
  totalUsers: number
  totalBalance: number
  totalRecharges: number
  totalWithdrawals: number
  pendingWithdrawals: number
}

export const AdminFinanceService = {
  async getOverview(): Promise<AdminFinanceOverview> {
    const { data } = await api.get('/admin/finance')
    return data
  },
}
