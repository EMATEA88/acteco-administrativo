import { useEffect, useState } from "react"
import { api } from "../../services/api"

type NotificationItem = {
  id: number
  title: string
  message: string
  createdAt: string
}

export default function AdminNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null)

  /* =====================================================
     LOAD
  ===================================================== */

  const load = async () => {
    const res = await api.get("/admin/notifications")
    setItems(res.data.items || res.data || [])
  }

  useEffect(() => {
    load()
  }, [])

  /* =====================================================
     BROADCAST
  ===================================================== */

  const sendBroadcast = async () => {
    if (!title || !message) {
      alert("Título e mensagem são obrigatórios")
      return
    }

    await api.post("/admin/notifications/broadcast", {
      title,
      message
    })

    setTitle("")
    setMessage("")
    load()
  }

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteNotification = async (id: number) => {
    if (!confirm("Eliminar esta notificação?")) return

    try {
      setLoadingDeleteId(id)

      await api.delete(`/admin/notifications/${id}`)

      load()

    } catch (err) {
      console.error(err)
      alert("Erro ao eliminar notificação")
    } finally {
      setLoadingDeleteId(null)
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Notificações</h2>

      <input
        className="input"
        placeholder="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        className="input"
        placeholder="Mensagem"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />

      <button
        className="btn btn-primary"
        onClick={sendBroadcast}
      >
        Enviar Broadcast
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Mensagem</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {items.map(n => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td>{n.title}</td>
              <td>{n.message}</td>
              <td>{new Date(n.createdAt).toLocaleString()}</td>

              <td>
                <button
                  disabled={loadingDeleteId === n.id}
                  onClick={() => deleteNotification(n.id)}
                  className="
                    bg-red-600 hover:bg-red-700
                    text-white px-3 py-1 rounded text-sm
                  "
                >
                  {loadingDeleteId === n.id
                    ? "A eliminar..."
                    : "Eliminar"}
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}