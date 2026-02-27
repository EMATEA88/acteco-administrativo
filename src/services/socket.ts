import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function connectAdminSocket(token: string): Socket {

  if (socket && socket.connected) {
    return socket
  }

  socket = io(
    import.meta.env.VITE_API_URL || "http://localhost:3333",
    {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 20000,
      autoConnect: true,
    }
  )

  socket.on("connect_error", (err) => {
    console.error("Admin socket error:", err.message)
  })

  socket.on("disconnect", (reason) => {
    console.warn("Admin socket disconnected:", reason)
  })

  return socket
}

/* ✅ JOIN EM ORDEM ESPECÍFICA */
export function joinAdminOtc(orderId: number) {
  if (!socket) return
  socket.emit("admin:join-otc", orderId)
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export function getAdminSocket(): Socket | null {
  return socket
}