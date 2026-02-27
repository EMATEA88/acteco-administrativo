import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import DataTable from "../../components/admin/DataTable"
import { AdminService } from "../../services/admin.service"

interface Transaction {
  id: number
  type: string
  amount: number
  createdAt: string
  user?: {
    phone?: string
  }
}

export default function AdminTransactions() {

  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)

      const res = await AdminService.transactions()

      const list = Array.isArray(res)
        ? res
        : res?.items ?? []

      setItems(list)

    } catch {
      toast.error("Erro ao carregar transações")
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((t) => {
    if (!search) return true

    const s = search.toLowerCase()

    return (
      String(t.id).includes(s) ||
      String(t.user?.phone || "").toLowerCase().includes(s) ||
      String(t.type).toLowerCase().includes(s)
    )
  })

  if (loading) {
    return <div className="p-6">Carregando transações...</div>
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Transações</h1>

      <input
        placeholder="Pesquisar por ID, telefone ou tipo"
        className="border px-3 py-2 rounded w-80"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable
        data={filtered}
        columns={[
          { key: "id", label: "ID" },

          {
            key: "user",
            label: "Telefone",
            render: (r: Transaction) =>
              r.user?.phone || "-"
          },

          {
            key: "type",
            label: "Tipo",
            render: (r: Transaction) =>
              <TypeBadge type={r.type} />
          },

          {
            key: "amount",
            label: "Valor",
            render: (r: Transaction) =>
              formatMoney(r.amount)
          },

          {
            key: "createdAt",
            label: "Data",
            render: (r: Transaction) =>
              formatDate(r.createdAt)
          },
        ]}
      />
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {

  const styles: Record<string, string> = {
    RECHARGE: "bg-green-100 text-green-700",
    WITHDRAW: "bg-red-100 text-red-700",
    BUY_DEBIT: "bg-orange-100 text-orange-700",
    SELL_CREDIT: "bg-emerald-100 text-emerald-700",
    SERVICE_DEBIT: "bg-indigo-100 text-indigo-700",
    COMMISSION: "bg-purple-100 text-purple-700",
    GIFT: "bg-pink-100 text-pink-700",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-AO")
}
