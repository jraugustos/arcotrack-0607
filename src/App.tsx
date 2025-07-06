import { ArcoTrackApp } from './ArcoTrackApp'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ArcoTrackApp />
    </AuthProvider>
  )
}

export default App
