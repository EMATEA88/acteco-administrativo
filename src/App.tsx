import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"

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
import AdminGift from "./pages/admin/Gifts"
import Banks from "./pages/admin/Banks"
import AdminLogin from "./pages/admin/Login"

export default function App() {
  return (
    <BrowserRouter>
      {/* 🌱 TOAST GLOBAL */}
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #10b981",
              fontWeight: "500",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #ef4444",
              fontWeight: "500",
            },
          },
        }}
      />

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
          <Route path="banks" element={<Banks />} />
          <Route path="products" element={<Products />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="gift" element={<AdminGift />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
