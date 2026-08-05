import React, { useState } from 'react';
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Star,
  Award,
  Building2,
  TrendingUp,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Lead } from '../types';

interface ReportsViewProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ leads, selectedLead, onSelectLead }) => {
  const currentLead = selectedLead || leads[0];
  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentLead) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        Nenhum lead selecionado para relatório.
      </div>
    );
  }

  const diag = currentLead.diagnostic;

  const handlePrint = () => {
    window.print();
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls (Hidden when printing) */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="text-blue-600" size={22} /> Gerador de Relatório Diagnóstico & Entrega
            </h2>
            <p className="text-xs text-slate-500">
              Gere relatórios profissionais do Perfil da Empresa em formato de apresentação ou impressão PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-64">
              <select
                value={currentLead.id}
                onChange={(e) => {
                  const found = leads.find((l) => l.id === e.target.value);
                  if (found) onSelectLead(found);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.city})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <Printer size={14} /> Imprimir / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Report Header */}
        <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
                P
              </div>
              <span className="text-lg font-black tracking-wider uppercase text-indigo-900">
                PerfilPro Agência
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Relatório Oficial de Auditoria & Otimização de Perfil no Google
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-0.5">
            <span className="font-bold text-slate-800 block">Data da Emissão:</span>
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
            <span className="block text-[10px] text-slate-400">ID: {currentLead.placeId.substring(0, 16)}</span>
          </div>
        </div>

        {/* Company Overview & Score Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Empresa Auditada
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {currentLead.name}
            </h1>
            <p className="text-xs text-slate-600">
              {currentLead.category} • {currentLead.address}, {currentLead.city} - {currentLead.state}
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-2">
              <span>★ {currentLead.rating} ({currentLead.reviewsCount} avaliações)</span>
              <span>📷 {currentLead.photosCount} fotos</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-xs font-bold uppercase text-slate-500">Score de Oportunidade</span>
            <span
              className={`text-4xl font-black my-1 ${
                currentLead.score < 50
                  ? 'text-rose-600'
                  : currentLead.score < 75
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {currentLead.score}/100
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
              Grade {diag?.scoreGrade || 'C'}
            </span>
          </div>
        </div>

        {/* Summary Statement */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 border-l-4 border-indigo-600 pl-3">
            1. Resumo Executivo da Auditoria
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
            {diag?.summary || 'Auditoria concluída com base nas métricas oficiais do Google Meu Negócio.'}
          </p>
        </div>

        {/* Detailed Breakdown */}
        {diag && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 border-l-4 border-indigo-600 pl-3">
              2. Detalhamento dos Critérios Avaliados
            </h3>
            <div className="space-y-2.5">
              {diag.details.map((detail, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 flex items-center gap-1.5">
                      {detail.status === 'critical' ? (
                        <ShieldAlert size={14} className="text-rose-600" />
                      ) : detail.status === 'warning' ? (
                        <AlertTriangle size={14} className="text-amber-600" />
                      ) : (
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      )}
                      {detail.category}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      {detail.points} / {detail.maxPoints} pts
                    </span>
                  </div>
                  <p className="text-slate-600">
                    <strong>Situação Identificada:</strong> {detail.issue}
                  </p>
                  <p className="text-indigo-900 font-medium">
                    🎯 <strong>Ação Recomendada:</strong> {detail.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Before vs After Checklist */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 border-l-4 border-indigo-600 pl-3">
            3. Plano de Ação de Otimização (Antes x Depois)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
              <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                ❌ Perfil Atual (Sem Otimização)
              </h4>
              <ul className="space-y-1 text-rose-800">
                <li>• Sem descrição comercial com palavras-chave locais</li>
                <li>• Ausência de catálogo de serviços e produtos no perfil</li>
                <li>• Galeria de fotos desatualizada com pouca prova social</li>
                <li>• Baixo volume de avaliações e sem respostas da empresa</li>
              </ul>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                ✅ Perfil Otimizado pela Agência PerfilPro
              </h4>
              <ul className="space-y-1 text-emerald-800 font-medium">
                <li>• Descrição de 750 caracteres focada em indexação SEO</li>
                <li>• Catálogo completo de serviços com valores e descrições</li>
                <li>• Galeria com fotos profissionais e geotagging local</li>
                <li>• Rotina automatizada de coleta de avaliações 5 estrelas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-800">PerfilPro - Agência de Otimização de Perfis no Google</p>
          <p>Documento gerado para uso interno e apresentação comercial ao cliente.</p>
        </div>
      </div>
    </div>
  );
};
