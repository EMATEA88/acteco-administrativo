import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminService } from '../../services/admin.service'

interface User {
  id: number
  phone: string
  balance: number
  role: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      setLoading(true)
      const data = await AdminService.users()
      setUsers(data.items || [])
    } catch {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  // ================= SEARCH =================
  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      String(u.id).includes(s) ||
      u.phone.toLowerCase().includes(s)
    )
  })

  // ================= OPEN USER =================
  async function openUser(id: number) {
    try {
      const data = await AdminService.userDetails(id)
      setSelectedUser(data)
    } catch {
      toast.error('Erro ao carregar usuário')
    }
  }

  // ================= BALANCE =================
  async function adjustBalance(action: 'ADD' | 'SUBTRACT') {
    if (!amount || Number(amount) <= 0) {
      toast.error('Informe um valor válido')
      return
    }

    try {
      setSubmitting(true)

      const result = await AdminService.adjustUserBalance(
        selectedUser.id,
        {
          amount: Number(amount),
          action,
        }
      )

      toast.success(
        action === 'ADD'
          ? 'Saldo adicionado com sucesso'
          : 'Saldo subtraído com sucesso'
      )

      setSelectedUser({
        ...selectedUser,
        balance: result.balance,
      })

      setAmount('')
      await load()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || 'Erro ao ajustar saldo'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Usuários</h1>

      <input
        className="border px-3 py-2 rounded w-80"
        placeholder="Pesquisar por ID ou telefone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full bg-white rounded-xl shadow text-sm">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Telefone</th>
            <th className="p-3 text-left">Saldo</th>
            <th className="p-3 text-left">Role</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr
              key={u.id}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-3">{u.id}</td>

              <td
                className="p-3 text-blue-600 cursor-pointer hover:underline"
                onClick={() => openUser(u.id)}
              >
                {u.phone}
              </td>

              <td className="p-3 font-medium">
                {u.balance} Kz
              </td>
              <td className="p-3">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[420px] p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Detalhes do Usuário
            </h2>

            <div className="text-sm space-y-1">
              <p><b>ID:</b> {selectedUser.id}</p>
              <p><b>Telefone:</b> {selectedUser.phone}</p>
              <p><b>Saldo:</b> {selectedUser.balance} Kz</p>
              <p><b>Role:</b> {selectedUser.role}</p>

              {selectedUser.bank && (
                <>
                  <p><b>Banco:</b> {selectedUser.bank.bank}</p>
                  <p><b>IBAN:</b> {selectedUser.bank.iban}</p>
                </>
              )}
            </div>

            <input
              type="number"
              placeholder="Valor"
              className="border px-3 py-2 rounded w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                disabled={submitting}
                className="flex-1 bg-emerald-600 text-white py-2 rounded disabled:opacity-60"
                onClick={() => adjustBalance('ADD')}
              >
                + Adicionar
              </button>

              <button
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-2 rounded disabled:opacity-60"
                onClick={() => adjustBalance('SUBTRACT')}
              >
                − Subtrair
              </button>
            </div>

            <button
              className="text-sm text-gray-500 hover:underline"
              onClick={() => setSelectedUser(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
