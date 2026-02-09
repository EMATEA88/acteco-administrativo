import { useEffect, useState } from "react"
import DataTable from "../../components/admin/DataTable"
import { api } from "../../services/api"

export default function AdminTransactions() {
  const [items, setItems] = useState<any[]>([])

  const load = async () => {
    const res = await api.get("/admin/transactions")
    setItems(res.data.items || res.data)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <DataTable
      data={items}
      columns={[
        { key: "id", label: "ID" },
        { key: "user.phone", label: "Telefone" },
        { key: "type", label: "Tipo" },
        { key: "amount", label: "Valor" },
        { key: "createdAt", label: "Data" }
      ]}
    />
  )
}
