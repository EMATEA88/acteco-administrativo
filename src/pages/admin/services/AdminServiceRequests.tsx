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

export default function AdminServiceRequests() {

  const [data, setData] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  async function fetchData() {
    try {
      setLoading(true)
      const res = await AdminService.getServiceRequests()
      setData(res.items ?? [])
    } catch (error) {
      toast.error("Erro ao carregar serviços")
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(id: number) {
    if (!window.confirm("Confirmar conclusão do serviço?")) return

    try {
      setActionLoading(id)
      await AdminService.completeService(id)
      toast.success("Serviço concluído")
      await fetchData()
    } catch {
      toast.error("Falha ao concluir serviço")
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Service Requests
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Gestão institucional de pedidos de serviço
        </p>
      </div>

      {/* TABLE */}
      <div
        className="
          bg-[#14171A]
          border border-[#1E2329]
          rounded-2xl
          overflow-hidden
        "
      >

        <table className="w-full text-sm text-gray-300">

          <thead className="bg-[#1A1F24] text-gray-400">
            <tr>
              <Th>ID</Th>
              <Th>User</Th>
              <Th>Partner</Th>
              <Th>Plan</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>

          <tbody>

            {data.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}

            {data.map((r) => (
              <tr
                key={r.id}
                className="
                  border-t border-[#1E2329]
                  hover:bg-[#181C21]
                  transition
                "
              >

                <Td className="text-[#FCD535] font-semibold">
                  #{r.id}
                </Td>

                <Td>{r.user?.phone ?? "-"}</Td>

                <Td>{r.plan?.partner?.name ?? "-"}</Td>

                <Td className="font-medium">
                  {r.plan?.name ?? "-"}
                </Td>

                <Td>
                  {formatMoney(r.amount)}
                </Td>

                <Td>
                  <StatusBadge status={r.status} />
                </Td>

                <Td>
                  {r.status === "IN_PROGRESS" && (
                    <button
                      disabled={actionLoading === r.id}
                      onClick={() => handleComplete(r.id)}
                      className="
                        bg-[#FCD535]
                        text-black
                        px-4 py-1.5
                        rounded-lg
                        text-xs
                        hover:scale-105
                        transition
                        disabled:opacity-50
                      "
                    >
                      {actionLoading === r.id
                        ? "Processando..."
                        : "Concluir"}
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

/* ========================= */

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
    <span
      className={`
        px-3 py-1
        rounded-full
        text-xs
        font-medium
        ${map[status]}
      `}
    >
      {status}
    </span>
  )
}

function Th({ children }: any) {
  return (
    <th className="px-6 py-4 text-left font-medium">
      {children}
    </th>
  )
}

function Td({ children, className = "" }: any) {
  return (
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA"
  }).format(value ?? 0)
}