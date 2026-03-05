import { api } from "./api"

export interface AdminLogItem {
  id: number
  action: string
  entity?: string
  entityId?: number
  metadata?: any
  createdAt: string
  admin?: {
    id: number
    phone?: string
  }
}

export interface AdminLogResponse {
  logs: AdminLogItem[]
  total: number
  page: number
  totalPages: number
}

export class AdminLogService {

  static async list(
    page = 1,
    limit = 20,
    action?: string,
    entity?: string
  ): Promise<AdminLogResponse> {

    const params: any = { page, limit }

    if (action) params.action = action
    if (entity) params.entity = entity

    const res = await api.get("/admin/log", { params })

    return res.data
  }

}