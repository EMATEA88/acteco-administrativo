import { useEffect, useState } from "react"
import { AdminService } from "../../services/admin.service"

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const data = await AdminService.users()
      setUsers(data.items || [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Usuários</h1>

      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Telefone</th>
            <th className="p-3 text-left">Saldo</th>
            <th className="p-3 text-left">Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.phone}</td>
              <td className="p-3">{u.balance}</td>
              <td className="p-3">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
