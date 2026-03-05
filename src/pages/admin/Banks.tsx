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

  // ================= LOAD =================

  async function loadBanks() {
    try {
      setLoading(true)
      const data = await AdminService.banks()
      setBanks(Array.isArray(data) ? data : data?.items ?? [])
    } catch {
      toast.error('Erro ao carregar bancos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanks()
  }, [])

  // ================= FORM =================

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
        await AdminService.updateBank(editingId, form)
        toast.success('Banco atualizado com sucesso')
      } else {
        await AdminService.createBank(form)
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
      await AdminService.deleteBank(id)
      setBanks(prev => prev.filter(b => b.id !== id))
      toast.success('Banco removido com sucesso')
    } catch {
      toast.error('Erro ao remover banco')
    }
  }

  // ================= UI =================

  return (
    <div className="p-8 space-y-8 text-white">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestão de Bancos
        </h1>
        <p className="text-sm text-gray-400">
          Contas bancárias usadas em depósitos e levantamentos
        </p>
      </div>

      {/* FORM CARD */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        p-6
      ">
        <h2 className="text-lg font-semibold mb-6">
          {editingId ? 'Editar Banco' : 'Adicionar Banco'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            className="
              bg-gray-900
              border border-gray-700
              px-4 py-2
              rounded-lg
              text-white
              focus:outline-none
              focus:border-emerald-500
            "
            placeholder="Nome do Titular"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="
              bg-gray-900
              border border-gray-700
              px-4 py-2
              rounded-lg
              text-white
              focus:outline-none
              focus:border-emerald-500
            "
            placeholder="Banco (ex: BAI, BFA)"
            value={form.bank}
            onChange={(e) =>
              setForm({ ...form, bank: e.target.value })
            }
          />

          <input
            className="
              bg-gray-900
              border border-gray-700
              px-4 py-2
              rounded-lg
              text-white
              focus:outline-none
              focus:border-emerald-500
            "
            placeholder="IBAN"
            value={form.iban}
            onChange={(e) =>
              setForm({ ...form, iban: e.target.value })
            }
          />

          <div className="md:col-span-3 flex gap-3 pt-4">

            <button
              type="submit"
              disabled={submitting}
              className="
                flex items-center gap-2
                rounded-lg
                bg-emerald-600
                px-5 py-2.5
                text-white
                hover:bg-emerald-700
                disabled:opacity-60
                transition
              "
            >
              {editingId ? <Save size={16} /> : <Plus size={16} />}
              {editingId ? 'Salvar Alterações' : 'Adicionar Banco'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="
                  flex items-center gap-2
                  rounded-lg
                  border border-gray-700
                  px-5 py-2.5
                  text-gray-300
                  hover:bg-gray-800
                  transition
                "
              >
                <X size={16} />
                Cancelar
              </button>
            )}

          </div>
        </form>
      </div>

      {/* TABLE CARD */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        overflow-hidden
      ">

        {loading ? (
          <div className="p-8 text-gray-400">
            A carregar bancos…
          </div>
        ) : banks.length === 0 ? (
          <div className="p-8 text-gray-500">
            Nenhum banco cadastrado
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Titular</th>
                <th className="px-6 py-4 text-left">Banco</th>
                <th className="px-6 py-4 text-left">IBAN</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>

              {banks.map((bank) => (
                <tr
                  key={bank.id}
                  className="
                    border-t border-gray-800
                    hover:bg-gray-800/40
                    transition duration-200
                  "
                >
                  <td className="px-6 py-4 font-semibold">
                    {bank.name}
                  </td>

                  <td className="px-6 py-4 text-gray-300">
                    {bank.bank}
                  </td>

                  <td className="px-6 py-4 font-mono text-gray-400">
                    {bank.iban}
                  </td>

                  <td className="px-6 py-4 flex justify-end gap-4">

                    <button
                      onClick={() => handleEdit(bank)}
                      className="
                        text-emerald-400
                        hover:text-emerald-300
                        transition
                      "
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(bank.id)}
                      className="
                        text-red-400
                        hover:text-red-300
                        transition
                      "
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