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

      const [
        ordersRes,
        statsRes,
        summaryRes,
        assetsRes,
      ] = await Promise.all([
        AdminService.otcOrders(),
        AdminService.otcStats(),
        AdminService.getOtcFinancialSummary(),
        AdminService.otcAssets(),
      ])

      setOrders(ordersRes.items ?? [])

      setStats({
        totalOrders: statsRes.totalOrders ?? 0,
        pending: statsRes.pending ?? 0,
        released: statsRes.released ?? 0,
        totalProfit: summaryRes.totalProfit ?? 0,
      })

      setAssets(assetsRes ?? [])
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
    return (
      <div className="p-10 text-gray-400">
        Carregando módulo OTC...
      </div>
    )

  return (
    <div className="p-10 space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          OTC Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Visão institucional do módulo OTC
        </p>
      </div>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <StatCard title="Total Ordens" value={stats.totalOrders} />

          <StatCard
            title="Pendentes"
            value={stats.pending}
            color="yellow"
          />

          <StatCard
            title="Concluídas"
            value={stats.released}
            color="green"
          />

          <StatCard
            title="Lucro Total"
            value={stats.totalProfit}
            color="primary"
            money
          />

        </div>
      )}

      {/* ORDERS TABLE */}
      <div className="bg-[#14171A] border border-[#1E2329] rounded-2xl overflow-hidden">

        <div className="px-8 py-6 border-b border-[#1E2329] text-white font-semibold">
          Ordens OTC
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm text-gray-300">

            <thead className="bg-[#1A1F24] text-gray-400">
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
                <tr
                  key={o.id}
                  className="
                    border-t border-[#1E2329]
                    hover:bg-[#181C21]
                    transition
                  "
                >
                  <Td className="text-[#FCD535] font-semibold">
                    #{o.id}
                  </Td>

                  <Td>{o.user?.phone ?? "-"}</Td>
                  <Td className="font-medium">
                    {o.asset?.symbol}
                  </Td>

                  <Td
                    className={
                      o.type === "BUY"
                        ? "text-green-400 font-semibold"
                        : "text-red-400 font-semibold"
                    }
                  >
                    {o.type}
                  </Td>

                  <Td>{formatMoney(o.totalAoa)}</Td>

                  <Td>
                    <Status status={o.status} />
                  </Td>

                  <Td>
                    {o.status === "PENDING" && (
                      <button
                        onClick={() => cancelOrder(o.id)}
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
                  </Td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* ASSETS */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-6">
          Gestão de Preços
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {assets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onReload={load}
            />
          ))}
        </div>
      </div>

    </div>
  )
}

/* ========================= */

function StatCard({
  title,
  value,
  money,
  color = "default"
}: any) {

  const map: Record<string, string> = {
    default: "text-white",
    yellow: "text-yellow-400",
    green: "text-green-400",
    primary: "text-[#FCD535]"
  }

  return (
    <div
      className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        p-6
        hover:bg-[#181C21]
        hover:scale-[1.02]
        transition
      "
    >
      <p className="text-gray-400 text-sm">
        {title}
      </p>

      <h2 className={`text-3xl font-semibold mt-3 ${map[color]}`}>
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
    <div
      className="
        bg-[#14171A]
        border border-[#1E2329]
        rounded-2xl
        p-6
        space-y-4
        hover:bg-[#181C21]
        hover:scale-[1.02]
        transition
      "
    >
      <h3 className="font-semibold text-white">
        {asset.symbol}
      </h3>

      <Input
        label="Buy"
        value={buy}
        setValue={setBuy}
        color="green"
      />

      <Input
        label="Sell"
        value={sell}
        setValue={setSell}
        color="red"
      />

      <button
        disabled={saving}
        onClick={save}
        className="
          w-full
          bg-[#FCD535]
          text-black
          py-2
          rounded-xl
          hover:scale-[1.02]
          transition
          disabled:opacity-50
        "
      >
        Atualizar
      </button>
    </div>
  )
}

function Input({ label, value, setValue, color }: any) {
  return (
    <div>
      <label className="text-xs text-gray-400">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={e => setValue(Number(e.target.value))}
        className={`
          mt-1 w-full
          bg-[#1A1F24]
          border border-[#1E2329]
          rounded-lg px-3 py-2
          text-${color}-400
          focus:outline-none
          transition
        `}
      />
    </div>
  )
}

function Status({ status }: any) {

  const map: Record<string, string> = {
    PENDING: "bg-yellow-900/40 text-yellow-400",
    PAID: "bg-blue-900/40 text-blue-400",
    RELEASED: "bg-green-900/40 text-green-400",
    CANCELLED: "bg-red-900/40 text-red-400",
    DISPUTED: "bg-orange-900/40 text-orange-400",
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
    currency: "AOA",
  }).format(Number(value ?? 0))
}