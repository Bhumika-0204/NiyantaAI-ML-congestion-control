import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SidebarLayout from './layouts/SidebarLayout'
import Dashboard from './components/Dashboard'
import ModelArchitecture from './pages/ModelArchitecture'
import SystemDocs from './pages/SystemDocs'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '2rem', color: '#ff8080', background: '#220000', minHeight: '100vh', fontFamily: 'monospace'}}>
          <h2>Dashboard React Rendering Crash:</h2>
          <pre>{String(this.state.error)}</pre>
          <pre style={{marginTop: '1rem', whiteSpace: 'pre-wrap'}}>{this.state.error && this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<SidebarLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="model-info" element={<ModelArchitecture />} />
          <Route path="system-docs" element={<SystemDocs />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export default App
