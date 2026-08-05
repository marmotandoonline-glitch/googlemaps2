import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  Clock,
  Building2,
  Image,
  DollarSign,
  ShieldCheck,
  Send,
  Sparkles,
  HelpCircle,
  Phone,
  Mail,
  Instagram,
  Globe,
} from 'lucide-react';
import { ClientPortalData, Lead } from '../types';

interface ClientPortalViewProps {
  lead?: Lead | null;
  onSubmitPortalData?: (portalData: ClientPortalData) => void;
  onReturnToAdmin?: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  lead,
  onSubmitPortalData,
  onReturnToAdmin,
}) => {
  const [companyName, setCompanyName] = useState(lead?.name || 'OdontoPrime Moema');
  const [logoUrl, setLogoUrl] = useState(lead?.clientPortalData?.logoUrl || '');
  const [photoInput, setPhotoInput] = useState('');
  const [photos, setPhotos] = useState<string[]>(
    lead?.clientPortalData?.photos || [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&fit=crop',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&fit=crop',
    ]
  );

  const [contactPhone, setContactPhone] = useState(lead?.phone || '(11) 98765-4321');
  const [contactEmail, setContactEmail] = useState(lead?.clientPortalData?.contactEmail || 'contato@empresa.com.br');
  const [servicesInput, setServicesInput] = useState(
    lead?.clientPortalData?.services.join(', ') || 'Limpeza de Pele, Harmonização Facial, Botox, Preenchimento'
  );
  const [productsInput, setProductsInput] = useState(
    lead?.clientPortalData?.products.join(', ') || 'Sérum Hidratante Home Care, Protetor Solar FPS 70'
  );

  const [paymentMethods, setPaymentMethods] = useState<string[]>(
    lead?.clientPortalData?.paymentMethods || ['PIX', 'Cartão de Crédito em até 10x', 'Dinheiro']
  );

  const [differentialsInput, setDifferentialsInput] = useState(
    lead?.clientPortalData?.differentials.join(', ') || 'Estacimento no local, Café gourmet espresso, Atendimento sem espera'
  );

  const [notes, setNotes] = useState(lead?.clientPortalData?.notes || 'Gostaríamos de enfatizar o atendimento rápido.');

  const [submitted, setSubmitted] = useState(Boolean(lead?.clientPortalData?.submittedAt));

  const handleAddPhoto = () => {
    if (!photoInput.trim()) return;
    setPhotos([...photos, photoInput.trim()]);
    setPhotoInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const portalData: ClientPortalData = {
      companyName,
      logoUrl,
      photos,
      businessHours: {
        Segunda: '08:00 - 18:00',
        Terça: '08:00 - 18:00',
        Quarta: '08:00 - 18:00',
        Quinta: '08:00 - 18:00',
        Sexta: '08:00 - 18:00',
        Sábado: '08:00 - 13:00',
        Domingo: 'Fechado',
      },
      services: servicesInput.split(',').map((s) => s.trim()).filter(Boolean),
      products: productsInput.split(',').map((p) => p.trim()).filter(Boolean),
      paymentMethods,
      differentials: differentialsInput.split(',').map((d) => d.trim()).filter(Boolean),
      socialLinks: {
        instagram: 'https://instagram.com/empresa',
        website: lead?.website || 'https://empresa.com.br',
      },
      contactEmail,
      contactPhone,
      notes,
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    if (onSubmitPortalData) {
      onSubmitPortalData(portalData);
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-8 space-y-8 font-sans">
      {/* Top Client Portal Navigation Bar */}
      <div className="max-w-4xl mx-auto flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold text-lg">
            P
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-900 dark:text-white">Portal do Cliente</h1>
            <p className="text-xs text-slate-500">PerfilPro Agência • Envio de Materiais para Otimização</p>
          </div>
        </div>

        {onReturnToAdmin && (
          <button
            onClick={onReturnToAdmin}
            className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            ← Voltar ao Painel da Agência
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step 1: Add Manager Instructions Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-800 space-y-4">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck size={18} /> Passo 1: Permissão de Gestão no Google
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Como adicionar nossa agência como Gestor do seu Perfil no Google
          </h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Para realizarmos as otimizações oficiais no seu Perfil da Empresa sem precisar da sua senha pessoal, siga o passo a passo oficial do Google:
          </p>

          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <li className="bg-slate-900/70 p-3 rounded-xl border border-indigo-500/30 space-y-1">
              <span className="font-extrabold text-blue-400">1. Acesse o Google</span>
              <p className="text-slate-300 text-[11px]">
                Pesquise por "Meu Negócio" no Google ou acesse <strong>business.google.com</strong> logado na sua conta.
              </p>
            </li>

            <li className="bg-slate-900/70 p-3 rounded-xl border border-indigo-500/30 space-y-1">
              <span className="font-extrabold text-blue-400">2. Configurações do Perfil</span>
              <p className="text-slate-300 text-[11px]">
                Clique nos 3 pontinhos verticais (canto superior direito) → <strong>Configurações do Perfil do negócio</strong>.
              </p>
            </li>

            <li className="bg-slate-900/70 p-3 rounded-xl border border-indigo-500/30 space-y-1">
              <span className="font-extrabold text-blue-400">3. Adicionar Usuário</span>
              <p className="text-slate-300 text-[11px]">
                Clique em <strong>Pessoas e acesso</strong> → Adicionar e insira o e-mail: <strong>gestao@perfilpro.agencia.com</strong> como <em>Gestor</em>.
              </p>
            </li>
          </ol>
        </div>

        {/* Step 2: Information & Photos Upload Form */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Passo 2: Envio de Fotos e Informações
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Formulário de Onboarding da Empresa
              </h3>
            </div>
            {submitted && (
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Dados Enviados
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Empresa / Marca
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone de Contato (WhatsApp)
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail Oficial
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL do Logo (Opcional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://suaempresa.com.br/logo.png"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Image size={16} /> Fotos do Estabelecimento, Fachada e Equipe
              </h4>
              <p className="text-xs text-slate-500">
                Adicione URLs das fotos da sua empresa para cadastrarmos na galeria otimizada do Google.
              </p>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="Cole a URL da foto (https://...)"
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  + Adicionar Foto
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video">
                    <img src={url} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Services & Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lista de Serviços (Separados por vírgula)
                </label>
                <textarea
                  value={servicesInput}
                  onChange={(e) => setServicesInput(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lista de Produtos / Combos (Separados por vírgula)
                </label>
                <textarea
                  value={productsInput}
                  onChange={(e) => setProductsInput(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Differentials & Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Diferenciais da Empresa (Estacimento, Acessibilidade, Café, etc.)
              </label>
              <input
                type="text"
                value={differentialsInput}
                onChange={(e) => setDifferentialsInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Observações Adicionais para a Equipe de Otimização
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Send size={16} /> Enviar Informações para a Agência PerfilPro
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
