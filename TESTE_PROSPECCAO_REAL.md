# Teste de prospecção real

URL: https://projeto-googleempresa.onrender.com/prospect

Parâmetros preenchidos manualmente no Lead Finder:
- Nicho/categoria: Clínica Odontológica
- Cidade: Rio de Janeiro
- Bairro: Copacabana
- UF: RJ

Após clicar em Pesquisar, a interface manteve os resultados anteriores:
- Sorriso Perfeito Moema — Clínica Odontológica — Moema — São Paulo - SP
- Odonto VIP Sp — Clínica Odontológica — Pinheiros — São Paulo - SP

A tela exibiu os filtros novos, mas os cards não mudaram para Rio de Janeiro/Copacabana. Isso indica falha funcional na busca publicada: o backend pode estar retornando dados fixos, ignorando os parâmetros, ou o frontend pode estar mantendo o estado antigo quando a requisição falha. Evidência capturada em 2026-08-06.

O CRM tinha 2 leads antes da nova pesquisa. Os dois cards ficaram marcados como No CRM após o último carregamento.
