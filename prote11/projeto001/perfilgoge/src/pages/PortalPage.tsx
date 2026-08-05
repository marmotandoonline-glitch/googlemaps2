import React from 'react';
import { useParams } from 'react-router-dom';
import { ClientPortalView } from '../components/ClientPortalView';

export const PortalPage: React.FC = () => {
  const { token } = useParams();

  // The ClientPortalView will call onSubmitPortalData -> we will POST to /api/client-portal/complete including token
  const handleSubmit = async (portalData: any) => {
    try {
      const res = await fetch('/api/client-portal/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, portalData, uploadedFiles: [] }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: 'Failed' }));
        alert('Erro: ' + (e.error || 'Falha ao enviar')); 
      } else {
        alert('Obrigado! Seus dados foram enviados com sucesso.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar dados do portal');
    }
  };

  return <ClientPortalView onSubmitPortalData={handleSubmit} />;
};
