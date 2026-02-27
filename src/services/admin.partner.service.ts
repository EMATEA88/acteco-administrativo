import { api } from '../services/api'

export type PartnerFinancial = {
  totalGross: number
  totalCommission: number
  totalNet: number
  totalPaid: number
  totalPending: number
}

export type Partner = {
  id: number
  name: string
  contact?: string
  email?: string
  isActive: boolean
  createdAt: string
  financial: PartnerFinancial
}

export type PartnerSettlement = {
  id: number
  grossAmount: number
  commissionAmount: number
  netAmount: number
  status: 'PENDING' | 'PAID'
  createdAt: string
}

export const AdminPartnerService = {
  /* ===============================
     LIST PARTNERS WITH FINANCIAL
  =============================== */
  async list(): Promise<Partner[]> {
    const { data } = await api.get('/admin/partners')
    return data
  },

  /* ===============================
     CREATE PARTNER
  =============================== */
  async create(payload: {
    name: string
    contact?: string
    email?: string
  }) {
    const { data } = await api.post('/admin/partners', payload)
    return data
  },

  /* ===============================
     TOGGLE ACTIVE / INACTIVE
  =============================== */
  async toggle(id: number) {
    const { data } = await api.patch(`/admin/partners/${id}/toggle`)
    return data
  },

  /* ===============================
     GENERATE SETTLEMENT
  =============================== */
  async generateSettlement(id: number) {
    const { data } = await api.post(
      `/admin/partners/${id}/generate-settlement`
    )
    return data
  },

  /* ===============================
     LIST SETTLEMENTS BY PARTNER
  =============================== */
  async listSettlements(partnerId: number): Promise<PartnerSettlement[]> {
    const { data } = await api.get(
      `/admin/partner-settlements/${partnerId}`
    )
    return data
  },

  /* ===============================
     MARK SETTLEMENT AS PAID
  =============================== */
  async markPaid(settlementId: number) {
    const { data } = await api.patch(
      `/admin/partners/settlement/${settlementId}/pay`
    )
    return data
  },
}
