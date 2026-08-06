# Achados da auditoria funcional — Googlemaps2

## Evidências do código

| Área | Achado | Impacto |
|---|---|---|
| Lead Finder | `handleSearch` apenas liga o loading e usa `setTimeout`; não chama `/api/leads/search`. | A pesquisa não executa busca real e mantém resultados estáticos. |
| Motor de IA | `handleGenerateAI` apenas usa `setTimeout`; não chama `/api/ai/generate`. | O botão “Gerar com IA” não gera conteúdo novo. A tela exibe conteúdo hardcoded. |
| Persistência de IA | `handleSave` apenas atualiza estado local via callback do App. | O conteúdo desaparece após recarregar e não é salvo no backend. |
| Portal | `ClientPortalView.handleSubmit` marca `submitted` imediatamente sem aguardar sucesso da API. | A interface informa sucesso mesmo quando o backend falha; não há avanço real de etapa. |
| Portal | Fotos são adicionadas apenas como URLs em estado local; não existe upload real. | A funcionalidade de upload é apenas visual. |
| Rank Tracker | CTA de relatório usa `alert(...)`. | Botão não gera, baixa ou envia relatório real. |
| Relatórios | A ação usa apenas `window.print()`, com template estático. | Não há geração/exportação real de PDF ou relatório persistido. |
| Propostas | É a única funcionalidade com ação externa perceptível, abrindo `wa.me`. | Confirma o relato do usuário; ainda há risco de token do portal usando propriedade incorreta. |
| App | Falhas de API são capturadas e apenas registradas em `console.error` ou ignoradas. | O usuário não recebe feedback e pode acreditar que o botão não funciona. |

## Verificação online

O serviço Render respondeu corretamente em `/api/health` com `{"status":"ok"}`, e a aplicação carrega a tela de login em `/login`. Portanto, o problema principal não é o processo HTTP estar offline, mas a implementação incompleta dos fluxos após a entrada no painel.

## Hipótese operacional

O projeto possui várias telas com aparência pronta, porém algumas funcionalidades centrais são protótipos locais: busca, geração de IA, salvamento, portal e relatório. A correção deve conectar o frontend às rotas existentes, criar persistência para conteúdo gerado e tratar estados de carregamento/erro/sucesso de maneira explícita.

## Observação sobre produção

A correção anterior do Prisma foi enviada no commit `86a0bf2`; ainda é necessário confirmar no Render se `prisma migrate deploy` foi executado no banco de produção antes de validar os fluxos autenticados.

## Evidência externa

- URL online: https://projeto-googleempresa.onrender.com/login
- Health check: https://projeto-googleempresa.onrender.com/api/health
- Repositório: https://github.com/marmotandoonline-glitch/googlemaps2
EOF

cat /home/ubuntu/googlemaps2/AUDITORIA_ACHADOS.md

## Correções implementadas nesta auditoria

1. O Lead Finder agora chama `POST /api/leads/search`, mostra carregamento, erro e estado vazio, em vez de apenas simular uma espera.
2. O Motor de IA agora cria um job real, acompanha o processamento, normaliza o resultado do worker Gemini e mostra erros quando Redis, worker ou chave de IA não estão disponíveis.
3. O controller `/api/ai/generate` agora usa a fila `aiQueue`; o worker é iniciado no processo do servidor quando `REDIS_URL` e `GEMINI_API_KEY` estão configurados.
4. O botão de salvar IA persiste `aiContentMap` por `PATCH /api/leads/:id`.
5. O portal administrativo ganhou rota própria `/client-portal`; o link público `/portal/:token` continua separado.
6. O envio do portal aguarda a resposta real do backend, impede envio duplicado e só mostra sucesso após persistência.
7. Propostas passaram a persistir mensagem e vídeo no backend e deixaram de usar fallback de telefone falso; o link usa `clientPortalToken`.
8. O CTA do Rank Tracker copia um relatório comercial real para a área de transferência, em vez de exibir apenas um alerta.
9. Os diagnósticos do Lead Finder e do CRM passaram a abrir modais funcionais, removendo alertas como mecanismo principal.
10. O CRM passou a usar `clientPortalToken` nas URLs do portal.

## Validação

A compilação de produção foi executada com sucesso três vezes após as mudanças, incluindo `prisma generate`, `vite build` e `tsc --project tsconfig.json`. A aplicação online também respondeu ao health check do Render com status `ok`.

## Limitações que dependem do Render

Para a geração de IA funcionar em produção, o serviço precisa ter `REDIS_URL` apontando para Redis acessível e `GEMINI_API_KEY` configurada. Para o schema corrigido, o comando de deploy deve executar `npx prisma migrate deploy --schema=prisma/schema.prisma`. Sem essas variáveis, a interface exibirá o erro correspondente em vez de fingir sucesso.

EOF


## Rodada de testes online — 06/08/2026

A aplicação foi acessada no Render com a conta administrativa fornecida. Foram percorridos login, dashboard, Lead Finder, CRM e Motor de IA.

| Falha reproduzida | Evidência | Correção aplicada |
|---|---|---|
| `POST /api/leads/search` retornava HTTP 503 ao conectar ao `overpass-api.de`. | A chamada autenticada retornou erro de conexão ao motor OpenStreetMap. | A busca agora usa três endpoints Overpass em failover, timeout controlado, validação de status e sanitização dos termos. Telefones não são mais fabricados aleatoriamente. |
| Links do Portal do Cliente apareciam como `/portal/` ou usavam tokens mockados não aceitos pelo backend. | No CRM online, `OdontoPrime Moema` exibiu um link sem token. | Foi criado `POST /api/leads/:id/portal-token`; o botão Copiar Link gera um token criptograficamente válido e copia o link real. |
| `GET /api/leads` retornava HTTP 502 em produção. | A chamada autenticada no navegador e por requisição direta retornou a página 502 do Render. | A listagem captura falhas Prisma e retorna JSON HTTP 503. O script de start executa `prisma migrate deploy` antes de iniciar a API, corrigindo o desalinhamento de schema no Render. |

A compilação de produção foi executada novamente com sucesso, incluindo Prisma Client, Vite, TypeScript e `git diff --check`. É necessário publicar o commit e aguardar o redeploy para validar esses mesmos fluxos pós-correção no Render.


## Falha de login reportada — 06/08/2026

O endpoint publicado `POST /api/auth/login` foi testado diretamente três vezes com as credenciais administrativas fornecidas e retornou HTTP 200 com token JWT válido em todas as tentativas. O health check do Render também retornou HTTP 200. A falha observada no navegador é compatível com cold start ou resposta transitória 502/503/504 do Render, que antes era convertida diretamente na mensagem genérica `Login failed`.

O `AuthProvider` foi corrigido para interpretar respostas JSON e HTML, distinguir credenciais inválidas de indisponibilidade do servidor e repetir automaticamente até três vezes em erros transitórios do Render, com espera progressiva. A compilação de produção foi validada com sucesso.
