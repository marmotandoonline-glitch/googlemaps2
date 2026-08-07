# Fontes externas para avaliação das ferramentas

## Typebot
URL: https://docs.typebot.io/self-hosting/get-started
- Typebot self-hosted exige que a equipe gerencie servidor, banco, storage, backups, segurança, upgrades, capacidade, uptime e estabilidade.
- A instalação é composta por duas aplicações Next.js: builder e viewer.
- Usa PostgreSQL; a documentação recomenda Neon para produção.
- A licença é Functional Source License (FSL), não uma licença permissiva comum; a documentação diz que não é permitido comercializar acesso à própria instância como serviço de hospedagem nem integrar o editor em software vendido para competir com o Typebot Cloud.

## Chatwoot
URL: https://developers.chatwoot.com/self-hosted
- Chatwoot self-hosted suporta Linux VM, Docker, Kubernetes e cloud providers.
- Requisitos mínimos documentados: 2 CPUs, 4 GB RAM, 20 GB SSD, PostgreSQL 12+ e Redis 6+; recomendações de produção são maiores.
- Exige manutenção, HTTPS, backups, firewall, SMTP e operação própria.

## LiteLLM
URL: https://docs.litellm.ai/docs/
- LiteLLM fornece interface unificada para mais de 100 provedores e formato compatível com OpenAI.
- O gateway self-hosted tem retries/fallbacks, chaves virtuais, limites/orçamentos, logging, guardrails e UI administrativa.
- Pode ser executado como proxy/gateway, inclusive via container.

## Plausible
URL: https://plausible.io/docs/self-hosting
- Plausible Community Edition é self-hosted e AGPLv3.
- A equipe que self-hospeda assume servidor, backups, uptime, capacidade, segurança e upgrades.
- A edição comunitária não inclui algumas funcionalidades premium, como Sites API, SSO, funnels de marketing, jornadas e ecommerce revenue goals.

## Strapi
URL: https://strapi.io/hosting
- Strapi Community Edition é MIT e pode ser self-hosted.
- Suporta PostgreSQL, MySQL e MariaDB em produção e SQLite para desenvolvimento.
- É uma aplicação Node extensível, mas adiciona um CMS e banco/operacional separados.

## listmonk
URL: https://listmonk.app/docs/
- listmonk é um gerenciador self-hosted de newsletters/listas de alta performance.
- É um binário standalone e tem PostgreSQL como única dependência declarada.
- Licença AGPLv3.

## n8n
URLs consultadas:
- https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode
- https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling
- https://docs.n8n.io/deploy/host-n8n/install-options/install-with-npm
- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook
- https://docs.n8n.io/deploy/host-n8n/configure-n8n/basic-configuration/use-environment-variables
- A documentação oficial indica suporte a self-hosting, webhooks, variáveis de ambiente, controle de concorrência e queue mode para escala.

## Firecrawl
URL consultada: https://docs.firecrawl.dev/contributing/self-hosting
- A extração foi incompleta na página consultada; não usar afirmações detalhadas sobre requisitos sem validação adicional.

## Contexto técnico do PerfilPro
Repositório: https://github.com/marmotandoonline-glitch/googlemaps2
- Projeto atual é um monólito React/Vite + Express + Prisma/PostgreSQL, hospedado na Render com banco Neon.
- Já possui Lead Finder, CRM, propostas, Portal do Cliente, Rank Tracker, Motor de IA, Redis/IORedis, BullMQ condicional e WhatsApp via Baileys.
- O projeto teve incidente de incompatibilidade BullMQ/Upstash e falha de baseline Prisma; adicionar muitos serviços self-hosted aumentaria o risco operacional.

## Revisão Typebot — 2026-08-07

A licença atual do repositório `baptistearno/typebot.io` é Functional Source License (FSL). A licença permite uso e auto-hospedagem, mas restringe `Competing Use`, incluindo disponibilizar o software em produto ou serviço comercial que compete com o próprio Typebot. Para o PerfilPro, uma instância para uso interno da agência é uma opção plausível; oferecer Typebot como construtor white-label ou serviço de chatbot para clientes exige revisão jurídica/licencial específica. A recomendação operacional é não incorporar Typebot ao produto nesta fase; usar formulários nativos do PerfilPro ou n8n para captação até haver autorização adequada.

Fontes: https://github.com/baptistearno/typebot.io/blob/main/LICENSE ; https://typebot.com/blog/typebot-is-now-fair-source ; https://docs.typebot.io/self-hosting/get-started
