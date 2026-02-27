import { useEffect, useState } from 'react'
import { KYCService } from '../../../services/kyc'

interface Verification {
  user: {
    id: number
    phone: string
  }
  frontImage: string
  backImage: string
  selfieImage: string
  status: string
  rejectionReason?: string
}

export default function AdminKYCPage() {

  const [data, setData] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await KYCService.list()
    setData(res.data.items)
    setLoading(false)
  }

  async function approve(userId: number) {
    await KYCService.approve(userId)
    load()
  }

  async function reject(userId: number) {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return
    await KYCService.reject(userId, reason)
    load()
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <div>Carregando...</div>

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Verificações KYC</h1>

      {data.map((item) => (

        <div
          key={item.user.id}
          className="bg-white shadow rounded-xl p-4 space-y-4"
        >

          <div className="flex justify-between">
            <div>
              <p><strong>User:</strong> {item.user.phone}</p>
              <p>Status: {item.status}</p>
            </div>

            {item.status === 'PENDING' && (
              <div className="space-x-2">
                <button
                  onClick={() => approve(item.user.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Aprovar
                </button>

                <button
                  onClick={() => reject(item.user.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Rejeitar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <img src={item.frontImage} className="rounded" />
            <img src={item.backImage} className="rounded" />
            <img src={item.selfieImage} className="rounded" />
          </div>

          {item.rejectionReason && (
            <p className="text-red-500">
              Motivo: {item.rejectionReason}
            </p>
          )}

        </div>
      ))}

    </div>
  )
}
