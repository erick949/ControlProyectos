import { useEffect, useState } from 'react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Petición al backend de Django
    fetch('http://127.0.0.1:8000/api/status/')
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con el servidor');
        return res.json();
      })
      .then((data) => {
        setBackendStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4 font-sans">
      <div className="rounded-xl bg-slate-800 p-8 shadow-xl border border-slate-700 text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-sky-400 mb-4">
          Control de Proyectos
        </h1>
        
        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 text-sm mb-4">
          <p className="text-slate-400 font-semibold mb-2">Estado de la conexión Backend:</p>
          
          {loading && <p className="text-yellow-400 animate-pulse">Conectando con Django...</p>}
          
          {error && (
            <p className="text-rose-400 font-mono text-xs">
              ❌ {error}. Revisa que el servidor Django esté corriendo.
            </p>
          )}

          {backendStatus && (
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🟢 {backendStatus.status.toUpperCase()}
              </span>
              <p className="text-slate-200">{backendStatus.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}