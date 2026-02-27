import { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { AdminService } from "../../services/admin.service"

type Order = {
  id: number
  type: "BUY" | "SELL"
  status: string
  totalAoa: number
  quantity: number
  createdAt: string
  user?: { phone?: string }
  asset?: { symbol?: string }
}

type Stats = {
  totalOrders: number
  pending: number
  released: number
  totalProfit: number
}

type Asset = {
  id: number
  symbol: string
  buyPrice: number
  sellPrice: number
}

export default function OTC() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [ordersRes, statsRes, assetsRes] = await Promise.all([
        AdminService.otcOrders(),
        AdminService.otcStats(),
        AdminService.otcAssets(),
      ])

      setOrders(ordersRes.items ?? [])
      setStats(statsRes)
      setAssets(assetsRes)
    } catch {
      toast.error("Erro ao carregar OTC")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function cancelOrder(id: number) {
    if (!confirm("Confirmar cancelamento da ordem?")) return
    try {
      await AdminService.cancelOtcOrder(id)
      toast.success("Ordem cancelada")
      load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro")
    }
  }

  if (loading)
    return <div className="p-6 text-gray-500">Carregando módulo OTC...</div>

  return (
    <div className="p-8 space-y-10">

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Ordens" value={stats.totalOrders} />
          <StatCard title="Pendentes" value={stats.pending} />
          <StatCard title="Concluídas" value={stats.released} />
          <StatCard title="Lucro Total" value={stats.totalProfit} money />
        </div>
      )}

      {/* ORDERS */}
      <div className="bg-white rounded-2xl shadow border">
        <div className="p-6 border-b font-semibold text-lg">
          Ordens OTC
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <Th>ID</Th>
                <Th>Utilizador</Th>
                <Th>Asset</Th>
                <Th>Tipo</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Ação</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <Td>{o.id}</Td>
                  <Td>{o.user?.phone ?? "-"}</Td>
                  <Td>{o.asset?.symbol}</Td>
                  <Td>{o.type}</Td>
                  <Td>{formatMoney(o.totalAoa)}</Td>
                  <Td><Status status={o.status} /></Td>
                  <Td>
                    {o.status === "PENDING" && (
                      <button
                        onClick={() => cancelOrder(o.id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Cancelar
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSETS */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Gestão de Preços
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} onReload={load} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, money }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow border">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">
        {money ? formatMoney(value) : value}
      </h2>
    </div>
  )
}

function AssetCard({ asset, onReload }: any) {
  const [buy, setBuy] = useState(asset.buyPrice)
  const [sell, setSell] = useState(asset.sellPrice)
  const [saving, setSaving] = useState(false)

  async function save() {
    try {
      setSaving(true)
      await AdminService.updateOtcAsset(asset.id, buy, sell)
      toast.success("Preço atualizado")
      onReload()
    } catch {
      toast.error("Erro ao atualizar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow border space-y-4">
      <h3 className="font-semibold">{asset.symbol}</h3>

      <Input label="Buy" value={buy} setValue={setBuy} />
      <Input label="Sell" value={sell} setValue={setSell} />

      <button
        disabled={saving}
        onClick={save}
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
      >
        Atualizar
      </button>
    </div>
  )
}

function Input({ label, value, setValue }: any) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="w-full border rounded-lg px-3 py-2 mt-1"
      />
    </div>
  )
}

function Status({ status }: any) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    RELEASED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    DISPUTED: "bg-orange-100 text-orange-700",
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>
      {status}
    </span>
  )
}

function Th({ children }: any) {
  return <th className="p-4 text-left">{children}</th>
}

function Td({ children }: any) {
  return <td className="p-4">{children}</td>
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value)
}