import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import ReportForm from './pages/ReportForm'
import ReportView from './pages/ReportView'
import Planning from './pages/Planning'
import History from './pages/History'
import Chat from './pages/Chat'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/reports/new" element={
              <ProtectedRoute>
                <ReportForm />
              </ProtectedRoute>
            } />
            
            <Route path="/reports/:id" element={
              <ProtectedRoute>
                <ReportView />
              </ProtectedRoute>
            } />
            
            <Route path="/reports/:id/edit" element={
              <ProtectedRoute>
                <ReportForm />
              </ProtectedRoute>
            } />
            
            <Route path="/planning" element={
              <ProtectedRoute>
                <Planning />
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App