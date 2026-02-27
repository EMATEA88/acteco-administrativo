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
      setOrders(res.items)
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
    return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Ordens OTC
      </h1>

      <table className="w-full bg-white shadow rounded-xl text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Utilizador</th>
            <th className="p-3 text-left">Asset</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-left">Quantidade</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Ação</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-b hover:bg-gray-50">

              <td className="p-3 text-blue-600 font-semibold">
                <Link to={`/admin/otc/orders/${o.id}`}>
                  #{o.id}
                </Link>
              </td>

              <td className="p-3">{o.user?.phone}</td>
              <td className="p-3">{o.asset?.symbol}</td>
              <td className="p-3">{o.type}</td>
              <td className="p-3">{o.quantity}</td>
              <td className="p-3">
                {o.totalAoa.toLocaleString()} Kz
              </td>

              <td className="p-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${o.status === "PENDING" && "bg-yellow-100 text-yellow-700"}
                  ${o.status === "RELEASED" && "bg-green-100 text-green-700"}
                  ${o.status === "EXPIRED" && "bg-gray-200 text-gray-700"}
                `}>
                  {o.status}
                </span>
              </td>

              <td className="p-3">
                {o.status === "PENDING" && (
                  <button
                    onClick={() => cancel(o.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
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
  )
}