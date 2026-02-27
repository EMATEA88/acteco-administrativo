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
      <div className="p-6 text-sm text-gray-500">
        A carregar comissões…
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Comissões</h1>

        <div className="text-sm font-semibold">
          Total: {formatMoney(total)}
        </div>
      </div>

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
              formatMoney(row.amount),
          },

          {
            key: "createdAt",
            label: "Data",
            render: (row: Commission) =>
              formatDate(row.createdAt),
          },
        ]}
      />
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {

  const styles: Record<string, string> = {
    RECHARGE: "bg-green-100 text-green-700",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[type] || "bg-gray-100 text-gray-600"}`}>
      {type}
    </span>
  )
}

function LevelBadge({ level }: { level: number }) {

  const colors: Record<number, string> = {
    1: "bg-blue-100 text-blue-700",
    2: "bg-indigo-100 text-indigo-700",
    3: "bg-purple-100 text-purple-700",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[level] || "bg-gray-100 text-gray-600"}`}>
      Nível {level}
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
