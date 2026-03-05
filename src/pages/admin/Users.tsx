import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { AdminService } from "../../services/admin.service"

interface User {
  id: number
  phone: string
  balance: number
  role: string
  isBlocked?: boolean

  fullName?: string
  iban?: string
  createdAt?: string
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
    return (
      <div className="p-8 text-gray-400">
        Carregando usuários...
      </div>
    )
  }

  const totalUsers = users.length
  const totalBalance = users.reduce(
    (sum, u) => sum + (u.balance || 0),
    0
  )
  const blockedUsers = users.filter((u) => u.isBlocked).length

  return (
    <div className="p-8 space-y-10 text-white">

      <h1 className="text-3xl font-bold tracking-tight">
        User Management
      </h1>

      {/* ===== KPIs ===== */}
      <div className="grid md:grid-cols-3 gap-6">

        <KpiCard
          title="Total Usuários"
          value={totalUsers}
          border="border-blue-500"
        />

        <KpiCard
          title="Saldo Total"
          value={totalBalance}
          money
          border="border-emerald-500"
        />

        <KpiCard
          title="Bloqueados"
          value={blockedUsers}
          border="border-red-500"
        />

      </div>

      {/* ===== SEARCH ===== */}
      <input
        className="
          bg-gray-950
          border border-gray-800
          px-4 py-3
          rounded-xl
          w-96
          focus:outline-none
          focus:border-emerald-500
        "
        placeholder="Pesquisar por ID ou telefone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ===== TABLE ===== */}
      <div className="
        bg-gray-950
        border border-gray-800
        rounded-2xl
        shadow-xl
        overflow-hidden
      ">

        <table className="w-full text-sm">

          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
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
                className="
                  border-t border-gray-800
                  hover:bg-gray-800/40
                  transition
                "
              >
                <td className="p-4 text-gray-400 text-xs">
                  #{u.id}
                </td>

                <td
                  className="p-4 font-medium text-blue-400 cursor-pointer hover:text-blue-300 transition"
                  onClick={() => openUser(u.id)}
                >
                  {u.phone}
                </td>

                <td className="p-4 font-semibold text-emerald-400">
                  {formatMoney(u.balance)}
                </td>

                <td className="p-4">
                  <StatusBadge blocked={u.isBlocked} />
                </td>

              </tr>
            ))}

          </tbody>
        </table>

      </div>

      {/* ===== MODAL ===== */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

          <div className="
            bg-gray-950
            border border-gray-800
            rounded-2xl
            w-[600px]
            p-8
            space-y-6
            shadow-2xl
          ">

            <h2 className="text-xl font-semibold">
              Detalhes do Usuário
            </h2>

            <div className="space-y-2 text-sm text-gray-300">

  <p><b>ID:</b> {selectedUser.id}</p>

  <p><b>Telefone:</b> {selectedUser.phone}</p>

  {selectedUser.fullName && (
    <p><b>Nome:</b> {selectedUser.fullName}</p>
  )}

  {selectedUser.iban && (
    <p>
      <b>IBAN:</b>
      <span className="font-mono text-xs ml-2 text-blue-400">
        {selectedUser.iban}
      </span>
    </p>
  )}

  {selectedUser.createdAt && (
    <p>
      <b>Criado em:</b>{" "}
      {new Date(selectedUser.createdAt).toLocaleString("pt-AO")}
    </p>
  )}

  <p className="text-emerald-400 font-semibold text-lg">
    {formatMoney(selectedUser.balance)}
  </p>

  <p><b>Role:</b> {selectedUser.role}</p>

</div>

<p><b>Banco:</b> {selectedUser.bankName || "Não definido"}</p>

<p className="font-mono text-blue-400 text-xs">
  <b>IBAN:</b> {selectedUser.iban || "Não definido"}
</p>

            <button
              onClick={toggleUserBlock}
              className={`
                w-full py-2 rounded-lg text-white transition
                ${selectedUser.isBlocked
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"}
              `}
            >
              {selectedUser.isBlocked
                ? "Desbloquear Usuário"
                : "Bloquear Usuário"}
            </button>

            <div className="border-t border-gray-800 pt-4 space-y-3">

              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Ajuste Financeiro
              </p>

              <input
                type="number"
                placeholder="Valor"
                className="
                  bg-gray-900
                  border border-gray-700
                  px-4 py-2
                  rounded-lg
                  w-full
                  focus:outline-none
                  focus:border-emerald-500
                "
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="flex gap-3">

                <button
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition"
                  onClick={() => adjustBalance("ADD")}
                >
                  + Adicionar
                </button>

                <button
                  disabled={submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                  onClick={() => adjustBalance("SUBTRACT")}
                >
                  − Subtrair
                </button>

              </div>

            </div>

            <button
              className="text-sm text-gray-500 hover:text-gray-300 transition"
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

/* COMPONENTES */

function KpiCard({
  title,
  value,
  money,
  border
}: {
  title: string
  value: number
  money?: boolean
  border?: string
}) {
  return (
    <div className={`
      bg-gray-950
      border border-gray-800
      ${border}
      border-l-4
      rounded-2xl
      p-6
      shadow-lg
    `}>
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className="text-2xl font-bold mt-3">
        {money ? formatMoney(value) : value}
      </h2>
    </div>
  )
}

function StatusBadge({ blocked }: { blocked?: boolean }) {
  if (blocked) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600/20 text-red-400">
        BLOQUEADO
      </span>
    )
  }

  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/20 text-emerald-400">
      ATIVO
    </span>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2
  }).format(value ?? 0)
}