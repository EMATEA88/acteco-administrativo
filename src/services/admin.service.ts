import { api } from "./api"

export const AdminService = {

  // ================= DASHBOARD =================
  dashboard: async () => {
    const { data } = await api.get("/admin/dashboard")
    return data
  },

  // ================= USERS =================
  users: async (page = 1, limit = 20) => {
    const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`)
    return data
  },

  userDetail: async (id: number) => {
    const { data } = await api.get(`/admin/users/${id}`)
    return data
  },

  updateUserRole: async (id: number, role: "USER" | "ADMIN") => {
    const { data } = await api.patch(`/admin/users/${id}/role`, { role })
    return data
  },

  // ================= RECHARGES =================
  recharges: async () => {
    const { data } = await api.get("/admin/recharges")
    return data
  },

  approveRecharge: async (id: number) => {
    const { data } = await api.patch(`/admin/recharges/${id}/approve`)
    return data
  },

  rejectRecharge: async (id: number) => {
    const { data } = await api.patch(`/admin/recharges/${id}/reject`)
    return data
  },

  // ================= WITHDRAWALS =================
  withdrawals: async () => {
    const { data } = await api.get("/admin/withdrawals")
    return data
  },

  approveWithdrawal: async (id: number) => {
    const { data } = await api.patch(`/admin/withdrawals/${id}/approve`)
    return data
  },

  rejectWithdrawal: async (id: number) => {
    const { data } = await api.patch(`/admin/withdrawals/${id}/reject`)
    return data
  },

  // ================= NOTIFICATIONS =================
  notifications: async () => {
    const { data } = await api.get("/admin/notifications")
    return data
  },

  broadcastNotification: async (
    title: string,
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "SYSTEM" = "INFO"
  ) => {
    const { data } = await api.post("/admin/notifications/broadcast", {
      title,
      message,
      type,
    })
    return data
  },

  sendNotificationToUser: async (
    userId: number,
    title: string,
    message: string,
    type: "INFO" | "WARNING" | "SUCCESS" | "SYSTEM" = "INFO"
  ) => {
    const { data } = await api.post("/admin/notifications/send", {
      userId,
      title,
      message,
      type,
    })
    return data
  },

  deleteNotification: async (id: number) => {
    const { data } = await api.delete(`/admin/notifications/${id}`)
    return data
  },

  // ================= GIFTS =================
  gifts: async () => {
    const { data } = await api.get("/admin/gifts")
    return data
  },

  createGift: async (payload: {
    title: string
    amount: number
    totalQuantity?: number
  }) => {
    const { data } = await api.post("/admin/gifts", payload)
    return data
  },

  sendGiftToUser: async (giftId: number, userId: number) => {
    const { data } = await api.post(`/admin/gifts/${giftId}/send`, { userId })
    return data
  },

  broadcastGift: async (giftId: number) => {
    const { data } = await api.post(`/admin/gifts/${giftId}/broadcast`)
    return data
  },

  // ================= TRANSACTIONS ADMIN =================
  transactions: async () => {
    const { data } = await api.get("/admin/transactions")
    return data
  },

  // ================= COMMISSIONS =================
  commissions: async () => {
    const { data } = await api.get("/admin/commissions")
    return data
  },
}