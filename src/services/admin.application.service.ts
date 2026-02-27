import { api } from './api'

interface ListParams {
  page?: number
  status?: string
}

export const AdminApplicationService = {

  async list(params: ListParams) {

    const { data } = await api.get('/admin/applications', {
      params
    })

    return data
  },

  async stats() {
    const { data } = await api.get('/admin/applications/stats')
    return data
  },

  async cancel(id: number) {
    const { data } = await api.patch(
      `/admin/applications/${id}/cancel`
    )
    return data
  },

  async details(id: number) {
    const { data } = await api.get(
      `/admin/applications/${id}`
    )
    return data
  }

}