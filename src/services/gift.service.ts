import { api } from './api'

export type GiftGenerateDTO = {
  code: string
  amount: number
  expiresAt: string
}

export const GiftService = {
  async generate(amount: number, expiresInDays: number) {
    const res = await api.post('/gift/generate', {
      amount,
      expiresInDays,
    })

    return res.data as GiftGenerateDTO
  },

  async redeem(code: string) {
    const res = await api.post('/gift/redeem', {
      code,
    })

    return res.data
  },
}