import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Nav from './components/Nav'
import Landing from './routes/Landing'
import Apply from './routes/Apply'
import FounderStatus from './routes/FounderStatus'
import OwnerConsole from './routes/OwnerConsole'
import PainPointMap from './routes/PainPointMap'
import Dashboard from './routes/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/founder" element={<FounderStatus />} />
          <Route path="/founder/:id" element={<FounderStatus />} />
          <Route path="/owner" element={<OwnerConsole />} />
          <Route path="/map" element={<PainPointMap />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
