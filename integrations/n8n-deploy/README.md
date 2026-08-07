# n8n separado do PerfilPro

Esta pasta prepara uma instalação real do n8n, usando o repositório oficial clonado em `integrations/n8n` e uma imagem fixada na versão `2.34.0`. O n8n não é executado dentro do processo Node do PerfilPro e não substitui o CRM, o scoring, o banco ou a fila de WhatsApp.

## Uso permitido

O repositório oficial está sob a Sustainable Use License. Esta configuração é destinada exclusivamente ao uso interno da agência. Não deve ser oferecida como produto n8n, white-label ou serviço concorrente sem uma licença comercial compatível.

## Configuração

Copie `.env.example` para `.env` e preencha os segredos. Não faça commit do arquivo `.env`. O serviço exige uma chave de criptografia persistente, autenticação administrativa e um PostgreSQL separado ou um banco reservado para os dados do n8n.

## Execução

Em uma VM, Docker ou serviço separado com persistência, execute:

```bash
docker compose --env-file .env up -d
```

O volume `n8n_data` preserva credenciais e configurações. O PerfilPro deve apontar `N8N_WEBHOOK_URL` para o webhook de entrada do n8n e `N8N_WEBHOOK_SECRET` para um segredo diferente da senha administrativa. O worker do PerfilPro permanece opcional e desativado quando essas variáveis não estão configuradas.

## Primeiros workflows permitidos

A primeira implantação deve conter somente automações auxiliares, como alerta de erro, aviso por e-mail, backup agendado e sincronização de planilha. O n8n não deve receber propriedade do CRM, score, propostas ou fila WhatsApp. Cada workflow deve ser testado com eventos de homologação antes de ser ativado em produção.
