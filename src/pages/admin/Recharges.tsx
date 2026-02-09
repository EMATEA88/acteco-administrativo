import { useEffect, useState } from 'react'
import { AdminService } from '../../services/admin.service'

export default function Recharges() {

  const [items, setItems] = useState<any[]>([])

  async function load() {
    const data = await AdminService.recharges()
    setItems(data)
  }

  async function approve(id: number) {
    await AdminService.approveRecharge(id)
    load()
  }

  async function reject(id: number) {
    await AdminService.rejectRecharge(id)
    load()
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Recharges
      </h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">User</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>

          <tbody>

            {items.map((r) => (
              <tr key={r.id} className="border-t">

                <td className="p-3">{r.id}</td>

                <td className="p-3">
                  {r.user?.phone}
                </td>

                <td className="p-3">
                  {Number(r.amount).toLocaleString()} Kz
                </td>

                <td className="p-3">
                  {r.status}
                </td>

                <td className="p-3 flex gap-2">

                  {r.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => approve(r.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Aprovar
                      </button>

                      <button
                        onClick={() => reject(r.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}
