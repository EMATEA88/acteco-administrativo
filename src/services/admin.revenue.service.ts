import { api } from '../services/api'

export class AdminRevenueService {

  static async list(params?: any) {
    const { data } = await api.get(
      '/admin/revenue',
      { params }
    )
    return data
  }

  static async stats() {
    const { data } = await api.get(
      '/admin/revenue/stats'
    )
    return data
  }

  static async monthly(year?: number) {
    const { data } = await api.get(
      '/admin/revenue/monthly',
      {
        params: year ? { year } : undefined
      }
    )
    return data
  }
}