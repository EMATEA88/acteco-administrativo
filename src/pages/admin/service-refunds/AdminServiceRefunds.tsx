import { useEffect, useState } from "react"
import { AdminService } from "../../../services/admin.service"
import toast from "react-hot-toast"

interface ServiceRequest {
  id: number
  amount: number
  status: "IN_PROGRESS" | "COMPLETED" | "REJECTED"
  createdAt: string
  user: {
    id: number
    phone: string
    publicId: string
  }
  plan: {
    id: number
    name: string
    price: number
    partner: {
      id: number
      name: string
    }
  }
}

interface RefundStats {
  inProgress: number
  completed: number
  rejected: number
}

export default function AdminServiceRefunds() {

  const [data, setData] = useState<ServiceRequest[]>([])
  const [stats, setStats] = useState<RefundStats | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const res = await AdminService.getServiceRefunds({
        status: statusFilter || undefined
      })

      setData(res.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const res = await AdminService.getServiceRefundStats()
      setStats(res)
    } catch {
      setStats(null)
    }
  }

  async function handleRefund(id: number) {

    if (!window.confirm("Tem certeza que deseja cancelar e reembolsar este serviço?")) return
    if (!window.confirm("⚠ Esta operação é irreversível. Confirmar novamente?")) return

    try {
      setActionLoading(id)
      await AdminService.refundService(id)
      toast.success("Reembolso realizado com sucesso")
      await fetchData()
      await fetchStats()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Falha no reembolso")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [statusFilter])

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Service Refund Management
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Gestão institucional de cancelamentos e reembolsos
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-900/40 border border-red-800 p-4 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <StatCard
            label="Em Andamento"
            value={stats.inProgress}
            accent="yellow"
          />

          <StatCard
            label="Concluídos"
            value={stats.completed}
            accent="green"
          />

          <StatCard
            label="Rejeitados / Reembolsados"
            value={stats.rejected}
            accent="red"
          />

        </div>
      )}

      {/* FILTER */}
      <div>
        <select
          className="
            bg-[#1A1F24]
            border border-[#1E2329]
            px-4 py-2
            rounded-lg
            text-gray-300
            focus:outline-none
          "
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        overflow-hidden
      ">

        <table className="w-full text-sm text-gray-300">

          <thead className="bg-[#1A1F24] text-gray-400">
            <tr>
              <Th>ID</Th>
              <Th>Usuário</Th>
              <Th>Parceiro</Th>
              <Th>Plano</Th>
              <Th>Valor</Th>
              <Th>Status</Th>
              <Th>Ação</Th>
            </tr>
          </thead>

          <tbody>

            {data.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}

            {data.map((item) => (
              <tr
                key={item.id}
                className="
                  border-t border-[#1E2329]
                  hover:bg-[#181C21]
                  transition
                "
              >

                <Td className="text-[#FCD535] font-semibold">
                  #{item.id}
                </Td>

                <Td>{item.user.phone}</Td>
                <Td>{item.plan.partner.name}</Td>
                <Td className="font-medium">{item.plan.name}</Td>

                <Td>{formatMoney(item.amount)}</Td>

                <Td>
                  <StatusBadge status={item.status} />
                </Td>

                <Td>
                  {item.status === "IN_PROGRESS" && (
                    <button
                      disabled={actionLoading === item.id}
                      onClick={() => handleRefund(item.id)}
                      className="
                        bg-red-600
                        px-4 py-1.5
                        rounded-lg
                        text-xs
                        text-white
                        hover:scale-105
                        transition
                        disabled:opacity-50
                      "
                    >
                      {actionLoading === item.id
                        ? "Processando..."
                        : "Cancelar & Reembolsar"}
                    </button>
                  )}
                </Td>

              </tr>
            ))}

          </tbody>
        </table>

        {loading && (
          <div className="p-6 text-center text-gray-500">
            Carregando...
          </div>
        )}

      </div>

    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({
  label,
  value,
  accent
}: {
  label: string
  value: number
  accent: "yellow" | "green" | "red"
}) {

  const accentMap: Record<string, string> = {
    yellow: "text-yellow-400",
    green: "text-green-400",
    red: "text-red-400"
  }

  return (
    <div className="
      bg-[#14171A]
      border border-[#1E2329]
      rounded-2xl
      p-6
      hover:bg-[#181C21]
      transition
    ">
      <p className="text-gray-400 text-sm">
        {label}
      </p>
      <p className={`text-3xl font-semibold mt-3 ${accentMap[accent]}`}>
        {value}
      </p>
    </div>
  )
}

function StatusBadge({
  status
}: {
  status: "IN_PROGRESS" | "COMPLETED" | "REJECTED"
}) {

  const map: Record<string, string> = {
    IN_PROGRESS: "bg-yellow-900/40 text-yellow-400",
    COMPLETED: "bg-green-900/40 text-green-400",
    REJECTED: "bg-red-900/40 text-red-400",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  )
}

function Th({ children }: any) {
  return <th className="px-6 py-4 text-left font-medium">{children}</th>
}

function Td({ children, className = "" }: any) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(value ?? 0)
}