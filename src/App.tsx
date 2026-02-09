import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import AdminLayout from "./layouts/AdminLayout"
import ProtectedRoute from "./components/admin/ProtectedRoute"

import Dashboard from "./pages/admin/Dashboard"
import Users from "./pages/admin/Users"
import Recharges from "./pages/admin/Recharges"
import Withdrawals from "./pages/admin/Withdrawals"
import Products from "./pages/admin/Products"
import Transactions from "./pages/admin/Transactions"
import Commissions from "./pages/admin/Commissions"
import Notifications from "./pages/admin/Notifications"
import AdminGift from './pages/admin/Gifts'
import AdminLogin from "./pages/admin/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN (FORA DO ADMIN) */}
        <Route path="/login" element={<AdminLogin />} />

        {/* ADMIN (PROTEGIDO) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="recharges" element={<Recharges />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="products" element={<Products />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="/admin/gift" element={<AdminGift />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
