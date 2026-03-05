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
    return (
      <div className="p-8 text-gray-400">
        Carregando transações...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Transações
        </h1>
      </div>

      {/* SEARCH */}
      <div>
        <input
          placeholder="Pesquisar por ID, telefone ou tipo"
          className="
            bg-gray-900
            border border-gray-800
            px-4 py-2
            rounded-xl
            w-96
            text-sm
            focus:outline-none
            focus:ring-2
            focus:ring-emerald-500
            transition
          "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE CARD */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        overflow-hidden
      ">
        <DataTable
          data={filtered}
          columns={[
            {
              key: "id",
              label: "ID",
              render: (r: Transaction) => (
                <span className="text-gray-400 text-xs font-medium">
                  #{r.id}
                </span>
              )
            },

            {
              key: "user",
              label: "Telefone",
              render: (r: Transaction) =>
                <span className="font-semibold text-white">
                  {r.user?.phone || "-"}
                </span>
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
                <Amount value={r.amount} type={r.type} />
            },

            {
              key: "createdAt",
              label: "Data",
              render: (r: Transaction) =>
                <span className="text-gray-400 text-xs">
                  {formatDate(r.createdAt)}
                </span>
            },
          ]}
        />
      </div>

    </div>
  )
}

/* ================= AMOUNT ================= */

function Amount({ value, type }: { value: number; type: string }) {

  const creditTypes = ["RECHARGE", "SELL_CREDIT", "COMMISSION", "GIFT"]

  const isCredit = creditTypes.includes(type)

  return (
    <span className={`font-semibold ${
      isCredit ? "text-emerald-400" : "text-red-400"
    }`}>
      {formatMoney(value)}
    </span>
  )
}

/* ================= BADGES ================= */

function TypeBadge({ type }: { type: string }) {

  const styles: Record<string, string> = {
    RECHARGE: "bg-emerald-600/20 text-emerald-400",
    WITHDRAW: "bg-red-600/20 text-red-400",
    BUY_DEBIT: "bg-orange-600/20 text-orange-400",
    SELL_CREDIT: "bg-emerald-600/20 text-emerald-400",
    SERVICE_DEBIT: "bg-indigo-600/20 text-indigo-400",
    COMMISSION: "bg-purple-600/20 text-purple-400",
    GIFT: "bg-pink-600/20 text-pink-400",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[type] || "bg-gray-600/20 text-gray-400"}`}>
      {type}
    </span>
  )
}

/* ================= UTILS ================= */

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
  }).format(value ?? 0)
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-AO")
}