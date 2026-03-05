import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, CreditCard, BarChart3 } from "lucide-react"

export default function AdminBottomNav() {
  const base =
    "flex flex-col items-center justify-center text-xs"

  const active =
    "text-amber-400"

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0F1419] border-t border-[#1E2329] flex justify-around items-center">

      <NavLink to="/admin" end className={({ isActive }) =>
        `${base} ${isActive ? active : "text-gray-400"}`
      }>
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      <NavLink to="/admin/users" className={({ isActive }) =>
        `${base} ${isActive ? active : "text-gray-400"}`
      }>
        <Users size={18} />
        Utilizadores
      </NavLink>

      <NavLink to="/admin/deposits" className={({ isActive }) =>
        `${base} ${isActive ? active : "text-gray-400"}`
      }>
        <CreditCard size={18} />
        Depósitos
      </NavLink>

      <NavLink to="/admin/finance-dashboard" className={({ isActive }) =>
        `${base} ${isActive ? active : "text-gray-400"}`
      }>
        <BarChart3 size={18} />
        Financeiro
      </NavLink>

    </div>
  )
}