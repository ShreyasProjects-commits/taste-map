import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('loading...');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status))
      .catch((err) => setBackendStatus('error: ' + err.message));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '5rem' }}>
      <h1>Taste Map</h1>
      <p>Backend status: {backendStatus}</p>
    </div>
  );
}

export default App;