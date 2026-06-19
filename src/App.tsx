import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useBridgeStore } from './store/store'
import Nav from './components/Nav'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './routes/Login'
import Landing from './routes/Landing'
import Apply from './routes/Apply'
import FounderStatus from './routes/FounderStatus'
import OwnerConsole from './routes/OwnerConsole'
import PainPointMap from './routes/PainPointMap'
import Dashboard from './routes/Dashboard'
import Community from './routes/Community'

export default function App() {
  const hydrate = useBridgeStore((s) => s.hydrate)

  // Load any persisted backend state on startup (no-op with the in-memory repo).
  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <Nav />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />

          <Route path="/apply" element={
            <ProtectedRoute allowedRoles={['startup']}>
              <Apply />
            </ProtectedRoute>
          } />

          <Route path="/founder" element={
            <ProtectedRoute allowedRoles={['startup', 'internal_lead', 'admin']}>
              <FounderStatus />
            </ProtectedRoute>
          } />
          <Route path="/founder/:id" element={
            <ProtectedRoute allowedRoles={['startup', 'internal_lead', 'admin']}>
              <FounderStatus />
            </ProtectedRoute>
          } />

          <Route path="/owner" element={
            <ProtectedRoute allowedRoles={['internal_lead', 'admin']}>
              <OwnerConsole />
            </ProtectedRoute>
          } />

          <Route path="/map" element={
            <ProtectedRoute allowedRoles={['internal_lead', 'admin']}>
              <PainPointMap />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/community" element={
            <ProtectedRoute allowedRoles={['pool_member', 'internal_lead', 'admin']}>
              <Community />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
