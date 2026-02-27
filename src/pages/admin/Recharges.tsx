import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'

interface Recharge {
  id: number
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  user?: {
    phone: string
  }
}

export default function Recharges() {

  const [items, setItems] = useState<Recharge[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)

      const response = await AdminService.recharges()

      const list = Array.isArray(response)
        ? response
        : response?.items ?? []

      setItems(list)

    } catch {
      toast.error('Erro ao carregar recargas')
    } finally {
      setLoading(false)
    }
  }

  async function approve(id: number) {
    if (processingId) return

    try {
      setProcessingId(id)
      await AdminService.approveRecharge(id)
      toast.success('Recarga aprovada')

      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'APPROVED' }
            : item
        )
      )

    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao aprovar')
    } finally {
      setProcessingId(null)
    }
  }

  async function reject(id: number) {
    if (processingId) return

    try {
      setProcessingId(id)
      await AdminService.rejectRecharge(id)
      toast.success('Recarga rejeitada')

      setItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'REJECTED' }
            : item
        )
      )

    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao rejeitar')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return <div className="p-6">Carregando recargas...</div>
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Depósitos
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Usuário</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Nenhuma recarga encontrada
                </td>
              </tr>
            )}

            {items.map((r) => {

              const isProcessing = processingId === r.id

              return (
                <tr key={r.id} className="border-t">

                  <td className="p-3">{r.id}</td>

                  <td className="p-3">
                    {r.user?.phone || '—'}
                  </td>

                  <td className="p-3 font-medium">
                    {r.amount.toLocaleString()} Kz
                  </td>

                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="p-3 flex gap-2">

                    {r.status === 'PENDING' && (
                      <>
                        <button
                          disabled={isProcessing}
                          onClick={() => approve(r.id)}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded"
                        >
                          {isProcessing ? 'Processando...' : 'Aprovar'}
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => reject(r.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded"
                        >
                          {isProcessing ? 'Processando...' : 'Rejeitar'}
                        </button>
                      </>
                    )}

                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

    </div>
  )
}

function StatusBadge({ status }: { status: string }) {

  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}