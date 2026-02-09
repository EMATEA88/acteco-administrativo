import { useEffect, useState } from "react"
import DataTable from "../../components/admin/DataTable"
import { api } from "../../services/api"

type Commission = {
  id: number
  amount: number
  createdAt: string
  user?: {
    phone?: string
  }
}

export default function AdminCommissions() {
  const [items, setItems] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await api.get("/admin/commissions")
      setItems(res.data.items || res.data || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        A carregar comissões…
      </div>
    )
  }

  return (
    <div className="p-6">
      <DataTable
        data={items}
        columns={[
          { key: "id", label: "ID" },
          {
            key: "user.phone",
            label: "Telefone",
            render: (row: Commission) =>
              row.user?.phone || "-",
          },
          {
            key: "amount",
            label: "Valor",
            render: (row: Commission) =>
              `${row.amount.toLocaleString()} Kz`,
          },
          {
            key: "createdAt",
            label: "Data",
            render: (row: Commission) =>
              new Date(row.createdAt).toLocaleString(),
          },
        ]}
      />
    </div>
  )
}