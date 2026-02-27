import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { AdminService } from "../../services/admin.service"

interface User {
  id: number
  phone: string
  balance: number
  role: string
  isBlocked?: boolean
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const response = await AdminService.users()
      const list = Array.isArray(response)
        ? response
        : response?.items ?? []

      setUsers(list)
    } catch {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const s = search.toLowerCase()

    return (
      String(u.id).includes(s) ||
      u.phone?.toLowerCase().includes(s)
    )
  })

  async function openUser(id: number) {
    try {
      const data = await AdminService.userDetails(id)
      setSelectedUser(data)
    } catch {
      toast.error("Erro ao carregar usuário")
    }
  }

  async function toggleUserBlock() {
    if (!selectedUser) return

    try {
      if (selectedUser.isBlocked) {
        await AdminService.unblockUser(selectedUser.id)
        toast.success("Usuário desbloqueado")
      } else {
        await AdminService.blockUser(selectedUser.id)
        toast.success("Usuário bloqueado")
      }

      await openUser(selectedUser.id)
      await load()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro")
    }
  }

  async function adjustBalance(action: "ADD" | "SUBTRACT") {
    if (!amount || Number(amount) <= 0) {
      toast.error("Valor inválido")
      return
    }

    if (!selectedUser) return

    try {
      setSubmitting(true)

      const result = await AdminService.adjustUserBalance(
        selectedUser.id,
        {
          amount: Number(amount),
          action,
        }
      )

      setSelectedUser({
        ...selectedUser,
        balance: result.balance,
      })

      setAmount("")
      await load()

      toast.success("Saldo atualizado")
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Erro ao ajustar saldo"
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Carregando usuários...</div>
  }

  const totalUsers = users.length
  const totalBalance = users.reduce(
    (sum, u) => sum + (u.balance || 0),
    0
  )
  const blockedUsers = users.filter((u) => u.isBlocked).length

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold text-white">
        User Management
      </h1>

      {/* ===== KPIs ===== */}
      <div className="grid md:grid-cols-3 gap-6">

        <KpiCard
          title="Total Usuários"
          value={totalUsers}
          color="text-blue-400"
        />

        <KpiCard
          title="Saldo Total"
          value={totalBalance}
          money
          color="text-green-400"
        />

        <KpiCard
          title="Bloqueados"
          value={blockedUsers}
          color="text-red-400"
        />

      </div>

      {/* ===== SEARCH ===== */}
      <div>
        <input
          className="bg-gray-900 border border-gray-700 px-4 py-2 rounded w-80 text-white"
          placeholder="Pesquisar por ID ou telefone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">

        <table className="w-full text-sm">

          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Telefone</th>
              <th className="p-4 text-left">Saldo</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-800 hover:bg-gray-800/60 transition"
              >
                <td className="p-4">{u.id}</td>

                <td
                  className="p-4 text-blue-400 cursor-pointer hover:underline"
                  onClick={() => openUser(u.id)}
                >
                  {u.phone}
                </td>

                <td className="p-4 font-semibold text-green-400">
                  {formatMoney(u.balance)}
                </td>

                <td className="p-4">
                  {u.isBlocked ? (
                    <span className="px-2 py-1 text-xs rounded bg-red-600">
                      BLOQUEADO
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-green-600">
                      ATIVO
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* ===== MODAL ===== */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-[550px] p-6 space-y-5">

            <h2 className="text-lg font-semibold text-white">
              Detalhes do Usuário
            </h2>

            <div className="text-sm space-y-1 text-gray-300">
              <p><b>ID:</b> {selectedUser.id}</p>
              <p><b>Telefone:</b> {selectedUser.phone}</p>
              <p><b>Saldo:</b> {formatMoney(selectedUser.balance)}</p>
              <p><b>Role:</b> {selectedUser.role}</p>
            </div>

            <button
              onClick={toggleUserBlock}
              className={`w-full py-2 rounded text-white ${
                selectedUser.isBlocked
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {selectedUser.isBlocked
                ? "Desbloquear Usuário"
                : "Bloquear Usuário"}
            </button>

            <input
              type="number"
              placeholder="Valor"
              className="bg-gray-800 border border-gray-700 px-3 py-2 rounded w-full text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                disabled={submitting}
                className="flex-1 bg-emerald-600 text-white py-2 rounded"
                onClick={() => adjustBalance("ADD")}
              >
                + Adicionar
              </button>

              <button
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-2 rounded"
                onClick={() => adjustBalance("SUBTRACT")}
              >
                − Subtrair
              </button>
            </div>

            <button
              className="text-sm text-gray-400 hover:underline"
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

/* ===== COMPONENTES ===== */

function KpiCard({
  title,
  value,
  money,
  color
}: {
  title: string
  value: number
  money?: boolean
  color?: string
}) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg">
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className={`text-2xl font-bold mt-3 ${color}`}>
        {money ? formatMoney(value) : value}
      </h2>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2
  }).format(value ?? 0)
}