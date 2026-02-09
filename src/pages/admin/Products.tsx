import { useEffect, useState } from "react"
import DataTable from "../../components/admin/DataTable"
import { api } from "../../services/api"

type Product = {
  id: number
  name: string
  price: number
  dailyIncome: number
  dailyPercent: number
  durationDays: number
  isActive: boolean
  createdAt: string
}

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const load = async () => {
    try {
      const res = await api.get("/admin/products")

      const data = res.data?.items ?? res.data ?? []

      setItems(data)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  /* =========================
     STATUS TOGGLE (BACKEND CONTROLA)
  ========================= */

  const toggleStatus = async (productId: number) => {
    try {
      setProcessingId(productId)

      // ⚠ NÃO manda isActive → backend alterna sozinho
      await api.patch(`/admin/products/${productId}/status`)

      await load()
    } catch (err) {
      console.error(err)
      alert("Erro ao atualizar status do produto")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        A carregar produtos…
      </div>
    )
  }

  return (
    <div className="p-6">
      <DataTable
        data={items}
        columns={[
          { key: "id", label: "ID" },

          { key: "name", label: "Produto" },

          /* ================= PREÇO ================= */

          {
            key: "price",
            label: "Preço",
            render: (row: Product) =>
              `${row.price?.toLocaleString()} Kz`,
          },

          /* ================= VALOR REAL DIÁRIO ================= */

          {
            key: "dailyIncome",
            label: "Rendimento Diário",
            render: (row: Product) =>
              row.dailyIncome != null
                ? `${row.dailyIncome.toLocaleString()} Kz`
                : "-",
          },

          /* ================= DURAÇÃO ================= */

          {
            key: "durationDays",
            label: "Duração",
            render: (row: Product) =>
              `${row.durationDays} dias`,
          },

          /* ================= STATUS ================= */

          {
            key: "isActive",
            label: "Status",
            render: (row: Product) => (
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    row.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
              >
                {row.isActive ? "Ativo" : "Desativado"}
              </span>
            ),
          },

          /* ================= BOTÃO REAL ================= */

          {
            key: "actions",
            label: "Ações",
            render: (row: Product) => (
              <button
                disabled={processingId === row.id}
                onClick={() => toggleStatus(row.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition
                  ${
                    row.isActive
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
                  ${
                    processingId === row.id
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {processingId === row.id
                  ? "Processando..."
                  : row.isActive
                  ? "Desativar"
                  : "Ativar"}
              </button>
            ),
          },

          /* ================= DATA ================= */

          {
            key: "createdAt",
            label: "Criado",
            render: (row: Product) =>
              new Date(row.createdAt).toLocaleDateString(),
          },
        ]}
      />
    </div>
  )
}