import { useEffect, useState } from "react"
import DataTable from "../../components/admin/DataTable"
import { AdminService } from "../../services/admin.service"
import { api } from "../../services/api"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function Withdrawals() {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState("")

  const load = async () => {
    const res = await AdminService.withdrawals()
    console.log("WITHDRAWALS API:", res)
    setItems(res.items || res)
  }

  useEffect(() => {
    load()
  }, [])

  // ================= ACTIONS =================

  const approve = async (id: number) => {
    await api.patch(`/admin/withdrawals/${id}/approve`)
    load()
  }

  const reject = async (id: number) => {
    await api.patch(`/admin/withdrawals/${id}/reject`)
    load()
  }

  // ================= SEARCH =================

  const filtered = items.filter((i) => {
    if (!search) return true

    const s = search.toLowerCase()

    return (
      String(i.id).includes(s) ||
      String(i.userPhone || "").toLowerCase().includes(s) ||
      String(i.iban || "").toLowerCase().includes(s)
    )
  })

  // ================= EXPORT PDF =================

  const exportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text("Lista de Saques", 14, 15)

    const rows = filtered.map((w) => {
      const amount = Number(w.amount || 0)
      const fee = Number(w.fee || 0)

      // 🔥 GARANTIA ABSOLUTA
      const liquid =
        w.liquid !== undefined
          ? Number(w.liquid)
          : amount - fee

      return [
        w.userPhone || "-",
        w.iban || "-",
        amount.toFixed(2),
        fee.toFixed(2),
        liquid.toFixed(2),
      ]
    })

    autoTable(doc, {
      head: [["User", "IBAN", "Valor", "Taxa", "Líquido"]],
      body: rows,
      startY: 20,
    })

    doc.save("withdrawals.pdf")
  }

  // ================= UI =================

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <input
          placeholder="Pesquisar por ID, Telefone ou IBAN"
          className="border px-3 py-2 rounded w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={exportPDF}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>

      <DataTable
        data={filtered}
        columns={[
          { key: "id", label: "ID" },
          { key: "userPhone", label: "Utilizador" },
          { key: "iban", label: "IBAN" },
          { key: "amount", label: "Valor" },
          { key: "fee", label: "Taxa" },
          { key: "liquid", label: "Líquido" },
          { key: "status", label: "Estado" },

          {
            key: "actions",
            label: "Ações",
            render: (r: any) =>
              r.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => approve(r.id)}
                  >
                    Aprovar
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => reject(r.id)}
                  >
                    Rejeitar
                  </button>
                </div>
              ),
          },
        ]}
      />
    </div>
  )
}
