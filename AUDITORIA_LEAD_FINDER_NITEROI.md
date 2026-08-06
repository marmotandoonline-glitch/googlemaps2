# Auditoria do Lead Finder — Niterói

## Problema reproduzido

A busca antiga tratava o nicho quase como um filtro literal em poucas tags do OpenStreetMap. Para `Barbearia`, ela não procurava as classificações usuais `shop=hairdresser`, `shop=beauty` e `craft=hairdresser`. Além disso, o servidor eliminava qualquer resultado sem telefone, embora o telefone não esteja cadastrado para a maioria dos estabelecimentos do OpenStreetMap. Também descartava perfis com site e fotos, e gerava aleatoriamente avaliações e fotos, o que podia esconder resultados e produzir dados não verificáveis.

## Evidência externa

A query ampliada, executada contra o Overpass API, retornou 44 objetos nomeados para barbearias/beleza em Niterói. Entre os exemplos estavam Carminha Coiffeur, Delly Barbearia, Barbearia do Zé, Barbearia e Many Men Barbearia. A query antiga não completou por timeout no endpoint testado e, mesmo quando respondia, não cobria as tags corretas.

## Correções publicadas

A busca agora procura `nwr` (nós, caminhos e relações) por nome e por múltiplas taxonomias: `shop`, `craft`, `amenity`, `office`, `healthcare` e `tourism`. Para barbearias e beleza, adiciona aliases como `barbearia`, `barber`, `hairdresser`, `cabeleireiro`, `barbershop`, `salon` e `beauty`.

Resultados sem telefone, site, avaliação ou foto permanecem visíveis para não transformar falta de cadastro em “nenhum resultado”. As métricas deixam de ser inventadas aleatoriamente. Os resultados são ordenados pelo score e limitados aos 100 melhores.

As consultas aos três servidores Overpass agora são executadas em paralelo, usando o primeiro servidor saudável e timeout individual de 10 segundos. Isso reduz a chance de uma fonte lenta fazer o usuário receber uma mensagem genérica de erro.

## Commits

- `ba1780e` — cobertura ampliada, aliases, múltiplas tags e remoção dos filtros destrutivos.
- `0c7bee3` — consultas Overpass em paralelo para reduzir timeouts.

## Observação

O teste visual no ambiente publicado ainda capturou a versão anterior no primeiro momento do deploy. A validação final deve ser repetida após o novo commit `0c7bee3` terminar de ser propagado pelo serviço.
