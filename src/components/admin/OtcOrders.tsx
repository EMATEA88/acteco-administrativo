import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { AdminService } from "../../services/admin.service"

type AdminOtcOrder = {
  id: number
  type: "BUY" | "SELL"
  status: string
  totalAoa: number
  quantity: number
  createdAt: string
  user?: { phone?: string }
  asset?: { symbol?: string }
}

export default function OtcOrders() {

  const [orders, setOrders] = useState<AdminOtcOrder[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setLoading(true)
      const res = await AdminService.otcOrders()
      setOrders(res.items || [])
    } catch (err) {
      console.error(err)
      toast.error("Erro ao carregar ordens")
    } finally {
      setLoading(false)
    }
  }

  async function cancel(id: number) {
    if (!confirm("Cancelar esta ordem?")) return

    try {
      await AdminService.cancelOtcOrder(id)
      toast.success("Ordem cancelada")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro")
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading)
    return (
      <div className="p-10 text-gray-400">
        Carregando ordens...
      </div>
    )

  return (
    <div className="p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Ordens OTC
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Gestão institucional das ordens OTC
        </p>
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl overflow-hidden">

        <table className="w-full text-sm text-gray-300">

          <thead className="bg-[#1A1F24] text-gray-400">
            <tr>
              <th className="px-6 py-4 text-left font-medium">ID</th>
              <th className="px-6 py-4 text-left font-medium">Utilizador</th>
              <th className="px-6 py-4 text-left font-medium">Asset</th>
              <th className="px-6 py-4 text-left font-medium">Tipo</th>
              <th className="px-6 py-4 text-left font-medium">Quantidade</th>
              <th className="px-6 py-4 text-left font-medium">Total</th>
              <th className="px-6 py-4 text-left font-medium">Status</th>
              <th className="px-6 py-4 text-left font-medium">Ação</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(o => (
              <tr
                key={o.id}
                className="
                  border-t border-[#1E2329]
                  hover:bg-[#181C21]
                  transition
                "
              >

                <td className="px-6 py-4">
                  <Link
                    to={`/admin/otc/orders/${o.id}`}
                    className="
                      text-[#FCD535]
                      font-semibold
                      hover:underline
                    "
                  >
                    #{o.id}
                  </Link>
                </td>

                <td className="px-6 py-4">
                  {o.user?.phone || "-"}
                </td>

                <td className="px-6 py-4 font-medium">
                  {o.asset?.symbol}
                </td>

                <td
                  className={`
                    px-6 py-4 font-semibold
                    ${o.type === "BUY" ? "text-green-400" : "text-red-400"}
                  `}
                >
                  {o.type}
                </td>

                <td className="px-6 py-4">
                  {o.quantity}
                </td>

                <td className="px-6 py-4 font-medium">
                  {o.totalAoa.toLocaleString()} Kz
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={o.status} />
                </td>

                <td className="px-6 py-4">
                  {o.status === "PENDING" && (
                    <button
                      onClick={() => cancel(o.id)}
                      className="
                        bg-[#F6465D]
                        text-white
                        px-4 py-1.5
                        rounded-lg
                        text-xs
                        hover:scale-105
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

      </div>

    </div>
  )
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }: { status: string }) {

  const base = "px-3 py-1 rounded-full text-xs font-medium"

  const map: Record<string, string> = {
    PENDING: "bg-yellow-900/40 text-yellow-400",
    PAID: "bg-blue-900/40 text-blue-400",
    RELEASED: "bg-green-900/40 text-green-400",
    CANCELLED: "bg-red-900/40 text-red-400",
    EXPIRED: "bg-gray-700 text-gray-300",
    DISPUTED: "bg-orange-900/40 text-orange-400"
  }

  return (
    <span className={`${base} ${map[status] || "bg-[#1A1F24] text-gray-300"}`}>
      {status}
    </span>
  )
}