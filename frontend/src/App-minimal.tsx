import React, { useState, useEffect } from 'react';

function App() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        console.log('Backend connected:', data);
        return fetch('http://localhost:5000/api/entities');
      })
      .then(res => res.json())
      .then(data => {
        setEntities(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to connect to backend: ' + err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏦 Tax Analyzer - Minimal Test</h1>
      
      <div style={{ background: '#f0f8ff', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>✅ Backend Connection: SUCCESS</h3>
        <p>Your tax analyzer backend is running and connected!</p>
      </div>

      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '5px' }}>
        <h3>📊 Entities ({entities.length})</h3>
        {entities.length === 0 ? (
          <p>No entities yet. Create one using the API:</p>
        ) : (
          <ul>
            {entities.map((entity: any) => (
              <li key={entity.id}>
                <strong>{entity.name}</strong> ({entity.type}) - {entity.taxReturns?.length || 0} tax returns
              </li>
            ))}
          </ul>
        )}
        
        <div style={{ background: 'white', padding: '10px', borderRadius: '3px', marginTop: '10px' }}>
          <strong>Test API Call:</strong><br/>
          <code>curl -X POST http://localhost:5000/api/entities -H "Content-Type: application/json" -d '{{"name":"Test Entity","type":"Individual"}}'</code>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
        <h3>🚀 Next Steps</h3>
        <ol>
          <li>Your backend is working perfectly!</li>
          <li>Install full dependencies: <code>npm install @mui/material @emotion/react @emotion/styled axios</code></li>
          <li>Or continue with this minimal version to test functionality</li>
        </ol>
      </div>
    </div>
  );
}

export default App;