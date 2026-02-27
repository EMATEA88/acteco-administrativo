import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminApplicationService } from '../../services/admin.application.service'

interface Application {
  id: number
  amount: string
  interestRate: string
  periodDays: number
  totalReturn: string
  status: string
  createdAt: string
  maturityDate: string
  user: {
    phone: string
    publicId: string
  }
}

export default function AdminApplications() {

  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    load()
  }, [page, statusFilter])

  async function load() {
  try {
    setLoading(true)

    const response = await AdminApplicationService.list({
      page,
      status: statusFilter || undefined
    })

    setItems(response.data || [])
    setTotalPages(response.pages || 1)

  } catch (err: any) {
    console.error(err)
    toast.error('Erro ao carregar aplicações')
  } finally {
    setLoading(false)
  }
}

  async function cancel(id: number) {
    if (!confirm('Confirmar cancelamento?')) return

    try {
      await AdminApplicationService.cancel(id)
      toast.success('Aplicação cancelada')
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro')
    }
  }

  if (loading)
    return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Aplicações (Admin)
      </h1>

      {/* FILTER */}
      <div>
        <select
          value={statusFilter}
          onChange={e => {
            setPage(1)
            setStatusFilter(e.target.value)
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">Todos</option>
          <option value="ACTIVE">Ativas</option>
          <option value="MATURED">Vencidas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Prazo</th>
              <th className="p-3 text-left">Retorno</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.map(app => (
              <tr key={app.id} className="border-t">

                <td className="p-3">
                  {app.user.phone}
                </td>

                <td className="p-3">
                  {Number(app.amount).toLocaleString()} Kz
                </td>

                <td className="p-3">
                  {app.periodDays} dias
                </td>

                <td className="p-3">
                  {Number(app.totalReturn).toLocaleString()} Kz
                </td>

                <td className="p-3">
                  {app.status}
                </td>

                <td className="p-3">
                  {app.status === 'ACTIVE' && (
                    <button
                      onClick={() => cancel(app.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Cancelar
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {/* PAGINATION */}
        <div className="flex justify-between p-4 bg-gray-50">

          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>

          <span>
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Próxima
          </button>

        </div>

      </div>
    </div>
  )
}