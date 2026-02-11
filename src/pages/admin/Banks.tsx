import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'

interface Bank {
  id: number
  name: string
  bank: string
  iban: string
  createdAt: string
}

export default function Banks() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [form, setForm] = useState({
    name: '',
    bank: '',
    iban: '',
  })

  // =============================
  // LOAD
  // =============================
  async function loadBanks() {
    try {
      setLoading(true)
      const data = await AdminService.banks() // GET /admin/banks
      setBanks(data)
    } catch {
      toast.error('Erro ao carregar bancos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanks()
  }, [])

  // =============================
  // FORM
  // =============================
  function resetForm() {
    setForm({ name: '', bank: '', iban: '' })
    setEditingId(null)
  }

  function handleEdit(bank: Bank) {
    setEditingId(bank.id)
    setForm({
      name: bank.name,
      bank: bank.bank,
      iban: bank.iban,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.bank || !form.iban) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      setSubmitting(true)

      if (editingId) {
        await AdminService.updateBank(editingId, form) // PUT /admin/banks/:id
        toast.success('Banco atualizado com sucesso')
      } else {
        await AdminService.createBank(form) // POST /admin/banks
        toast.success('Banco adicionado com sucesso')
      }

      resetForm()
      await loadBanks()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Erro ao salvar banco'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Deseja eliminar este banco?')) return

    try {
      await AdminService.deleteBank(id) // DELETE /admin/banks/:id
      setBanks((prev) => prev.filter((b) => b.id !== id))
      toast.success('Banco removido com sucesso')
    } catch {
      toast.error('Erro ao remover banco')
    }
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Gestão de Bancos
        </h1>
        <p className="text-sm text-gray-500">
          Contas bancárias usadas em depósitos e levantamentos
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-medium mb-4">
          {editingId ? 'Editar Banco' : 'Adicionar Banco'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            className="input"
            placeholder="Nome do Titular"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="input"
            placeholder="Banco (ex: BAI, BFA)"
            value={form.bank}
            onChange={(e) =>
              setForm({ ...form, bank: e.target.value })
            }
          />

          <input
            className="input"
            placeholder="IBAN"
            value={form.iban}
            onChange={(e) =>
              setForm({ ...form, iban: e.target.value })
            }
          />

          <div className="md:col-span-3 flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? 'Salvar Alterações' : 'Adicionar Banco'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-lg border px-5 py-2.5 text-gray-600 hover:bg-gray-50"
              >
                <X size={16} />
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-gray-500">A carregar bancos…</div>
        ) : banks.length === 0 ? (
          <div className="p-6 text-gray-500">
            Nenhum banco cadastrado
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">Titular</th>
                <th className="px-6 py-3 text-left">Banco</th>
                <th className="px-6 py-3 text-left">IBAN</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {banks.map((bank) => (
                <tr key={bank.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">
                    {bank.name}
                  </td>
                  <td className="px-6 py-3">{bank.bank}</td>
                  <td className="px-6 py-3 font-mono">
                    {bank.iban}
                  </td>
                  <td className="px-6 py-3 flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(bank)}
                      className="text-emerald-600 hover:text-emerald-800"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(bank.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
