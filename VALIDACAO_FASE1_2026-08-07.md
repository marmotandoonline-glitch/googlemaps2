# Validação da Fase 1 — 2026-08-07

## Resultado atual

O build de produção passou após as entregas de scraping, scoring, fila WhatsApp, follow-up, entrega GBP e ponte n8n.

O endpoint público `https://projeto-googleempresa.onrender.com/api/health` respondeu HTTP 200 em três verificações consecutivas, com tempos entre aproximadamente 2,7 e 3,6 segundos.

## Componentes validados por build

- Busca OSM/Overpass com retries, backoff, timeout, User-Agent e deduplicação.
- Score persistido e versionado no Prisma.
- Fila WhatsApp com aprovação, throttling, idempotência e auditoria.
- Worker de follow-up por estágio com tarefas e eventos, sem envio automático não aprovado.
- Tarefa de convite de gerente GBP após conclusão do Portal, também com aprovação.
- Ponte opcional de eventos para n8n.

## Limitação do smoke test local

O ambiente local possui `DATABASE_URL` apontando para `localhost:5432`, sem servidor PostgreSQL disponível. Com `JWT_SECRET` efêmero, o servidor avançou até `ensureProductionSchema`, mas encerrou porque não conseguiu alcançar o banco local. Isso não representa falha do código publicado; a Render usa o Neon e o health público está saudável. Para um teste ponta a ponta completo, é necessário executar contra uma base de teste ou contra o banco Neon com as credenciais apropriadas, sem expor essas credenciais no repositório.

## Próximo teste recomendado

Após o deploy do commit mais recente, autenticar no painel publicado e validar: busca real, criação de lead, geração de proposta, enfileiramento/aprovação de WhatsApp, criação de tarefa de follow-up e conclusão do Portal gerando a tarefa `gbp_manager_invite`.
