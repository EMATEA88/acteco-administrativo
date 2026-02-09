import { Outlet } from "react-router-dom"
import Sidebar from "../components/admin/Sidebar"
import Topbar from "../components/admin/Topbar"

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
