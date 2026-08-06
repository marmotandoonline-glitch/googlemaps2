import React from 'react';
import {
  FileText,
  Printer,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Lead } from '../types';

interface ReportsViewProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ leads, selectedLead, onSelectLead }) => {
  const currentLead = selectedLead || leads[0];

  const handlePrint = () => {
    window.print();
  };

  if (!currentLead) {
    return (
      <div className="p-12 text-center text-[#8A8AA3] bg-white rounded-[20px] border border-[#E7E7F1]">
        Nenhum lead selecionado para relatório.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="print:hidden bg-white p-6 rounded-[20px] border border-[#E7E7F1] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-semibold text-[#16162B] flex items-center gap-2">
              <FileText className="text-[#5B4FE9]" size={20} /> Gerador de Relatório Diagnóstico & Entrega
            </h2>
            <p className="text-xs text-[#8A8AA3]">
              Gere relatórios profissionais do Perfil da Empresa para impressão PDF.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentLead.id}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                if (found) onSelectLead(found);
              }}
              className="px-3.5 py-1.5 bg-[#ECEDF7]/50 border border-[#E2E2EE] rounded-full text-xs font-medium text-[#16162B]"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.city})</option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#5B4FE9] hover:bg-[#4C3FDB] text-white rounded-full text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
            >
              <Printer size={14} /> Imprimir / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white text-[#16162B] p-8 sm:p-12 rounded-[24px] border border-[#E7E7F1] shadow-xl max-w-4xl mx-auto space-y-8 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b border-[#E7E7F1] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#5B4FE9] rounded-xl flex items-center justify-center text-white font-black text-sm">
                P
              </div>
              <span className="text-base font-bold tracking-tight text-[#16162B]">
                PerfilPro Intelligence
              </span>
            </div>
            <p className="text-xs text-[#8A8AA3]">
              Relatório Oficial de Auditoria & Otimização de Perfil no Google
            </p>
          </div>

          <div className="text-right text-xs text-[#8A8AA3] space-y-0.5">
            <span className="font-semibold text-[#16162B] block">Data da Emissão:</span>
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#ECEDF7]/40 p-6 rounded-2xl border border-[#E2E2EE]">
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs font-bold text-[#5B4FE9] uppercase tracking-wider">
              Empresa Auditada
            </span>
            <h1 className="text-2xl font-bold text-[#16162B] leading-tight">
              {currentLead.name}
            </h1>
            <p className="text-xs text-[#8A8AA3]">
              {currentLead.category} • {currentLead.address}, {currentLead.city}
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#16162B] pt-2">
              <span>★ {currentLead.rating} ({currentLead.reviewsCount} avaliações)</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#E2E2EE] shadow-2xs text-center">
            <span className="text-xs font-bold uppercase text-[#8A8AA3]">Score de Oportunidade</span>
            <span className="text-3xl font-bold text-[#16162B] my-1">
              {currentLead.score}/100
            </span>
            <span className="text-[10px] font-mono bg-[#ECEDF7] text-[#5B4FE9] px-2 py-0.5 rounded-full font-bold">
              Avaliação Requerida
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-[#16162B] border-l-4 border-[#5B4FE9] pl-3">
            Resumo Executivo da Auditoria
          </h3>
          <p className="text-xs text-[#8A8AA3] leading-relaxed bg-[#ECEDF7]/30 p-4 rounded-xl border border-[#E2E2EE]">
            Identificamos falhas estruturais no posicionamento orgânico de Google Meu Negócio que estão limitando a captação de clientes locais.
          </p>
        </div>

        <div className="pt-6 border-t border-[#E7E7F1] text-center text-xs text-[#8A8AA3] space-y-1">
          <p className="font-semibold text-[#16162B]">PerfilPro - Agência de Otimização de Perfis no Google</p>
          <p>Documento gerado para uso interno e apresentação comercial ao cliente.</p>
        </div>
      </div>
    </div>
  );
};
