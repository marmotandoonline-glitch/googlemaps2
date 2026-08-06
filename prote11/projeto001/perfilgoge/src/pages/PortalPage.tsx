import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientPortalView } from '../components/ClientPortalView';

export const PortalPage: React.FC = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadName, setLeadName] = useState<string>('');

  // Validate token on mount by attempting to fetch upload URLs
  useEffect(() => {
    if (!token) {
      setError('Token inválido ou ausente na URL');
      setLoading(false);
      return;
    }

    // Validate token by making a test request to the upload endpoint
    fetch('/api/client-portal/request-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, files: [] }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token inválido ou expirado');
        return res.json();
      })
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setError('Token inválido ou expirado. Solicite um novo link ao administrador.');
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (portalData: any) => {
    try {
      const res = await fetch('/api/client-portal/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, portalData, uploadedFiles: [] }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: 'Falha ao enviar' }));
        setError(e.error || 'Falha ao enviar dados');
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar dados do portal');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-medium">Validando acesso ao portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 shadow text-center space-y-3">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl">!</div>
          <h2 className="text-lg font-bold text-slate-900">Acesso Negado</h2>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return <ClientPortalView onSubmitPortalData={handleSubmit} />;
};
