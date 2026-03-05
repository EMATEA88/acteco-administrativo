import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import DataTable from "../../components/admin/DataTable"
import { AdminService } from "../../services/admin.service"

interface Commission {
  id: number
  amount: number
  type: string
  level: number
  createdAt: string
  user?: {
    phone?: string
  }
}

export default function AdminCommissions() {

  const [items, setItems] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)

      const res = await AdminService.commissions()

      const list = Array.isArray(res)
        ? res
        : res?.items ?? []

      setItems(list)

    } catch {
      toast.error("Erro ao carregar comissões")
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((c) => {
    if (!search) return true

    const s = search.toLowerCase()

    return (
      String(c.id).includes(s) ||
      String(c.user?.phone || "").toLowerCase().includes(s) ||
      String(c.type).toLowerCase().includes(s)
    )
  })

  const total = filtered.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0
  )

  if (loading) {
    return (
      <div className="p-8 text-gray-400">
        A carregar comissões...
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Comissões
        </h1>

        <div className="text-lg font-semibold text-emerald-400">
          {formatMoney(total)}
        </div>
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
            { key: "id", label: "ID" },

            {
              key: "user",
              label: "Telefone",
              render: (row: Commission) =>
                row.user?.phone || "-",
            },

            {
              key: "level",
              label: "Nível",
              render: (row: Commission) =>
                <LevelBadge level={row.level} />
            },

            {
              key: "type",
              label: "Tipo",
              render: (row: Commission) =>
                <TypeBadge type={row.type} />
            },

            {
              key: "amount",
              label: "Valor",
              render: (row: Commission) =>
                <span className="text-yellow-400 font-semibold">
                  {formatMoney(row.amount)}
                </span>,
            },

            {
              key: "createdAt",
              label: "Data",
              render: (row: Commission) =>
                <span className="text-gray-400 text-xs">
                  {formatDate(row.createdAt)}
                </span>,
            },
          ]}
        />
      </div>
    </div>
  )
}

/* ================= BADGES ================= */

function TypeBadge({ type }: { type: string }) {

  const styles: Record<string, string> = {
    RECHARGE: "bg-emerald-600/20 text-emerald-400",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[type] || "bg-gray-600/20 text-gray-400"}`}>
      {type}
    </span>
  )
}

function LevelBadge({ level }: { level: number }) {

  const colors: Record<number, string> = {
    1: "bg-blue-600/20 text-blue-400",
    2: "bg-indigo-600/20 text-indigo-400",
    3: "bg-purple-600/20 text-purple-400",
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[level] || "bg-gray-600/20 text-gray-400"}`}>
      Nível {level}
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