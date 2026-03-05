import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminApplicationService } from '../../services/admin.application.service'
import { Loader2 } from 'lucide-react'

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

      setItems(response.items || [])
      setTotalPages(response.totalPages || 1)

    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao carregar aplicações')
    } finally {
      setLoading(false)
    }
  }

  async function cancel(id: number) {
    if (!confirm('Confirmar cancelamento da aplicação?')) return

    try {
      await AdminApplicationService.cancel(id)
      toast.success('Aplicação cancelada')
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro')
    }
  }

  function statusBadge(status: string) {
    const base =
      "px-2 py-1 rounded text-xs font-semibold"

    switch (status) {
      case 'ACTIVE':
        return `${base} bg-emerald-500/20 text-emerald-400`
      case 'MATURED':
        return `${base} bg-blue-500/20 text-blue-400`
      case 'CANCELLED':
        return `${base} bg-red-500/20 text-red-400`
      default:
        return `${base} bg-gray-500/20 text-gray-400`
    }
  }

  if (loading)
    return (
      <div className="p-8 flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" size={18} />
        Carregando aplicações...
      </div>
    )

  return (
    <div className="p-8 space-y-8 text-gray-200">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Investimentos
        </h1>

        <select
          value={statusFilter}
          onChange={e => {
            setPage(1)
            setStatusFilter(e.target.value)
          }}
          className="
            bg-[#1E2329]
            border border-white/10
            px-3 py-2
            rounded-lg
            text-sm
            focus:outline-none
            focus:border-emerald-500
          "
        >
          <option value="">Todos</option>
          <option value="ACTIVE">Ativas</option>
          <option value="MATURED">Vencidas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      <div className="
        bg-[#111827]
        border border-white/5
        rounded-2xl
        overflow-hidden
        shadow-xl
      ">

        <table className="w-full text-sm">

          <thead className="bg-[#0F172A] text-gray-400">
            <tr>
              <th className="p-4 text-left">Utilizador</th>
              <th className="p-4 text-left">Valor</th>
              <th className="p-4 text-left">Prazo</th>
              <th className="p-4 text-left">Retorno</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  Nenhuma aplicação encontrada.
                </td>
              </tr>
            )}

            {items.map(app => (
              <tr
                key={app.id}
                className="
                  border-t border-white/5
                  hover:bg-white/5
                  transition
                "
              >

                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {app.user.phone}
                    </span>
                    <span className="text-xs text-gray-500">
                      {app.user.publicId}
                    </span>
                  </div>
                </td>

                <td className="p-4 font-medium">
                  {Number(app.amount).toLocaleString()} Kz
                </td>

                <td className="p-4">
                  {app.periodDays} dias
                </td>

                <td className="p-4 text-yellow-400 font-semibold">
                  {Number(app.totalReturn).toLocaleString()} Kz
                </td>

                <td className="p-4">
                  <span className={statusBadge(app.status)}>
                    {app.status}
                  </span>
                </td>

                <td className="p-4">
                  {app.status === 'ACTIVE' && (
                    <button
                      onClick={() => cancel(app.id)}
                      className="
                        bg-red-600/80
                        hover:bg-red-600
                        text-white
                        px-3 py-1
                        rounded-lg
                        text-xs
                        transition
                      "
                    >
                      Cancelar
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        <div className="
          flex justify-between items-center
          p-4
          bg-[#0F172A]
          border-t border-white/5
          text-sm
        ">

          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="
              px-4 py-2
              rounded-lg
              bg-white/5
              hover:bg-white/10
              disabled:opacity-40
              transition
            "
          >
            Anterior
          </button>

          <span className="text-gray-400">
            Página {page} de {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="
              px-4 py-2
              rounded-lg
              bg-white/5
              hover:bg-white/10
              disabled:opacity-40
              transition
            "
          >
            Próxima
          </button>

        </div>

      </div>

    </div>
  )
}