# GestãoInk — Análise Completa

> Pesquisa realizada em: junho de 2026  
> Fonte principal: gestaoink.site, blog.gestaoink.site, aprender.gestaoink.com, gestoink.tawk.help  
> Classificação: Software SaaS vertical para estúdios de tatuagem — mercado brasileiro

---

## Visão Geral

GestãoInk é um sistema de gestão 100% online (SaaS) desenvolvido exclusivamente para estúdios de tatuagem e tatuadores autônomos brasileiros. O produto se posiciona como "o sistema mais completo do Brasil" para o segmento e afirma atender mais de 1.000 estúdios.

**Domínios identificados:**
- Site institucional: https://gestaoink.site (também: gestaoink.com — redireciona para .site)
- Plataforma/dashboard: https://gestaoink.tech
- Blog: https://blog.gestaoink.site
- Base de conhecimento: https://aprender.gestaoink.com
- Help Center (Tawk): https://gestoink.tawk.help
- API Swagger: https://gestaoink.tech/api/swagger-ui.html

**Contato:**
- Email: suporte@gestaoink.com
- WhatsApp suporte: (47) 98923-5660
- WhatsApp consultas: (47) 98870-2749
- Cidade/região: Santa Catarina (DDI 47 — região de Blumenau/Joinville)

---

## História e Empresa

**Desenvolvedor:** Yggra (yggra.com.br) — software house premium brasileira especializada em sistemas, apps e SaaS.

**O que se sabe sobre a Yggra:**
- Stack declarada: PHP, Python, Node.js no backend; Vue.js, Nuxt.js, React no frontend; MySQL; AWS (CI/CD, monitoramento, auto-scaling)
- Modelos de contratação: Pay & Go (ajustes pontuais), Projetos de escopo fixo, Squads dedicados
- GestãoInk aparece como logo no portfólio da Yggra, sem detalhes de projeto publicados

**Data de fundação:** Não confirmada publicamente. O blog mais antigo encontrado é de dezembro de 2024, mas o sistema claramente existe há mais tempo dado o volume de clientes (1.000+ estúdios). A URL de copyright na tela de login indica "2026" como ano ativo.

**Fundadores:** Não identificados publicamente em nenhuma fonte pesquisada.

**Canais de marketing identificados:**
- Instagram: @gestaoink ("Sistema para Estúdios de Tatuagem")
- Facebook: facebook.com/gestaoink
- YouTube: youtube.com/gestaoink (youtube.com/c/GestaoInk)
- Pinterest: br.pinterest.com/gestaoink
- Threads: threads.com/@gestaoink
- Linktree: linktr.ee/gestaoink
- Blog de conteúdo (SEO): blog.gestaoink.site
- Tráfego pago (categoria identificada no blog)
- Parceria/afiliados: shopmidia.com/gestaoink

---

## Modelo de Negócio

**Tipo:** SaaS por assinatura mensal/anual + plano vitalício  
**Mercado-alvo primário:** Estúdios de tatuagem brasileiros (multi-artistas)  
**Mercado-alvo secundário:** Tatuadores autônomos, estúdios com piercing  
**Trial:** 5 dias gratuitos, sem cartão de crédito  

**Proposta de valor declarada:**
- Redução de 70% no tempo administrativo
- Aumento de 30% na taxa de conversão de orçamentos
- 5x mais eficiência na gestão diária
- Redução de 80% no tempo semanal administrativo (de 10h para 2h, conforme artigo no Tripod)

**Canais de suporte:**
- WhatsApp (principal)
- Help Center (Tawk.to com 63 artigos em 18 categorias)
- Base de conhecimento em vídeo/artigo (aprender.gestaoink.com)
- Tutoriais em 30 minutos para funcionalidades principais
- Suporte VIP incluso no plano Pro

---

## Planos e Preços

> **Atenção:** Foram identificadas duas tabelas de preços diferentes em fontes distintas. Uma no site principal (mais recente) e outra em análise de terceiros (possivelmente desatualizada). O GestãoInk parece ter reajustado preços entre 2024 e 2025/2026.

### Tabela Atual (gestaoink.site — principal, mais confiável)

| Plano | Mensal | Anual | Profissionais | Destaque |
|-------|--------|-------|---------------|----------|
| **Autônomo** | R$ 199 | R$ 1.499 | 1 profissional | — |
| **Tattoo Studio Basic** | R$ 299 | R$ 1.999 | Até 5 profissionais | Mais popular |
| **Tattoo Studio Pro** | R$ 399 | R$ 3.199 | Até 15 profissionais | Suporte VIP |
| **Vitalício** | — | R$ 8.000 (era R$ 10.000) | (não confirmado — todos?) | Acesso permanente |

### Tabela Alternativa (fonte: tripod.com.br — possivelmente versão anterior)

| Plano | Mensal | Anual | Profissionais |
|-------|--------|-------|---------------|
| Autônomo | R$ 129 | R$ 999 | 1 |
| Studio Basic | R$ 169 | R$ 1.399 | 5 |
| Studio Pro | R$ 269 | R$ 1.999 | 15 |

### O que todos os planos incluem (declarado):
- Armazenamento ilimitado
- Acesso multidispositivo
- Todas as funcionalidades do sistema (aparentemente sem restrições por funcionalidade, só por número de profissionais)

### Diferenciais por plano:
- **Pro:** Suporte VIP
- **Vitalício:** Acesso permanente sem mensalidade (R$ 8.000 em 2025/2026, com desconto de R$ 2.000)

---

## Funcionalidades Completas

### Módulo 1 — Agendamento (Agenda)

**Funcionalidades confirmadas:**
- Agenda visual por profissional
- Controle de sinal/depósito (adiantamento): valor parcial registrado no momento do agendamento
- Pagamento parcial de sessões (saldo restante rastreado)
- Anexo de referências/imagens ao agendamento
- Reserva de materiais do estoque vinculada ao agendamento
- Gestão de espaços físicos (cadeiras/estações)
- Agendamento online para o cliente (link personalizado enviável via WhatsApp)
- Sincronização bidirecional com Google Calendar (por profissional)
  - Cada profissional tem seu Calendar ID configurado
  - Exclusão de calendários indesejados (feriados, pessoal) por lista de exclusão
  - Botão de reconexão quando a sessão Google expira
- Controle de confirmação de presença
- Observações por agendamento
- Visualizações: diária, semanal, por data específica
- Interface via WhatsApp: profissional pode consultar e criar agendamentos enviando mensagens formatadas para o número da plataforma (ex: "minha agenda, hoje")
- **API REST disponível:**
  - GET /api/agenda/ (parâmetros: limite, data_inicio)
  - POST /api/agenda/ (campos: cliente, artista, servico, data_agendamento, hora_inicio, hora_fim, valor_faltante, sinal)
  - PUT /api/agenda/{id} (campos: confirmacao, observacao)

**Limitações identificadas:**
- Integração WhatsApp para agenda ainda em expansão (orçamentos e financeiro via WhatsApp "em breve" conforme artigo de fev/2025)

---

### Módulo 2 — Orçamentos (CRM de Vendas)

**Funcionalidades confirmadas:**
- Formulário de orçamento personalizado com link único por estúdio
  - Link pode ser inserido na resposta automática do WhatsApp
  - Captura de leads 24h por dia sem intervenção manual
  - Dados do cliente automaticamente registrados no sistema
- Kanban visual de pipeline de orçamentos
  - Estágios de progressão (não especificados nominalmente nas fontes)
  - Tags para classificação de solicitações
  - Lembretes de follow-up
  - Envio de mensagens WhatsApp com template diretamente do Kanban
- Visão em lista alternativa (para filtragem por períodos maiores, atualização em lote de status, arquivamento de orçamentos antigos)
- Arquivamento automático quando serviço é concluído
- Histórico completo do cliente (orçamentos anteriores, interações)
- Links personalizados por orçamento enviáveis ao cliente
- Integração com sistema de anamnese (envio de ficha após aprovação do orçamento)
- Integração com WhatsApp: template de orçamento enviado diretamente
- **Diferencial declarado:** aumento de 30-40% na conversão de orçamentos

---

### Módulo 3 — Clientes / CRM

**Funcionalidades confirmadas:**
- Cadastro completo de clientes
- Histórico de serviços realizados com fotos
- Histórico de orçamentos
- Rastreamento de projetos de tatuagem (evolução por fotos)
- Monitoramento de cicatrização automatizado:
  - Check-ins automáticos nos dias 5, 15, 30 e 60 pós-sessão
  - Notificações via WhatsApp automáticas para o cliente
  - Registro fotográfico de evolução
- Aniversários: notificações automáticas de aniversário do cliente
- Pesquisas de satisfação pós-atendimento
- Sistema de indicação com benefícios (programa de referral)
- Segmentação de contatos por tags/etiquetas (para campanhas de marketing)
- Integração de leads do Instagram (não completamente detalhada nas fontes)
- Ficha de anamnese vinculada ao cadastro do cliente

---

### Módulo 4 — Anamnese (Formulários)

**Funcionalidades confirmadas:**
- Ficha de anamnese digital customizável por serviço
- Perguntas configuráveis com níveis de gravidade
  - Perguntas com gravidade "crítica" geram alertas automáticos para o estúdio e profissional
- Assinatura digital do cliente
- Assinatura automática do profissional (configurada no cadastro do profissional — popula automaticamente a ficha)
- Formas de distribuição:
  - Link compartilhável (cliente preenche remotamente)
  - Link pré-preenchido para clientes já cadastrados
  - Formulário interno (preenchido no sistema durante o atendimento)
  - Anexo de documentos digitalizados (para fichas em papel legadas)
- Termos e condições configuráveis por serviço
- Arquivo centralizado em "Atendimento > Ficha de Anamnese > Arquivadas"
- Personalização de logo nos documentos
- **Diferencial declarado:** "a mais completa do mercado"

---

### Módulo 5 — Financeiro

**Funcionalidades confirmadas:**

**Receitas e despesas:**
- Registro automático de entradas e saídas
- Contas a pagar com lembretes de despesas fixas
- Consumos internos personalizáveis
- Controle de receitas com data de liberação (para cartões)

**Caixa:**
- Abertura, transferência e fechamento diário de caixa
- Relatório de fechamento de caixa
- Visualização "Despesas e Receitas"

**Pagamentos:**
- PIX (registrado manualmente)
- Cartão de débito e crédito (com configuração de taxas das operadoras)
- Integração com maquininhas: PagSeguro, SumUp, Ton e outras (não confirmado lista completa)
- Comprovante de comissão em PDF

**Comissões:**
- Configuração por profissional (geral) ou por serviço específico
- Cálculo automático por período, profissional e serviço
- Desconto automático de "vales" profissionais
- Dois modelos de repasse:
  1. Estúdio paga ao profissional (modelo padrão)
  2. Profissional recebe do cliente e repassa ao estúdio (modelo inverso — documentado na base de conhecimento)
- Comprovante PDF gerado automaticamente

**Conciliação bancária:**
- Múltiplas contas bancárias cadastradas
- Reconciliação de movimentações

**Relatórios financeiros:**
- Relatórios e gráficos detalhados
- Análise por período, profissional e serviço
- "Área de diagnóstico do estúdio" (dashboard de KPIs)
- Fluxo de caixa
- Performance com metas (goal tracking — não confirmado detalhes)

**Nota Fiscal:**
- Emissão de NFS-e (Nota Fiscal de Serviços Eletrônica) integrada ao sistema
- Detalhes de integração com prefeituras/cidades não especificados nas fontes

---

### Módulo 6 — Estoque

**Funcionalidades confirmadas:**

**Cadastro de produtos:**
- Nome, unidade de medida, estoque mínimo e inicial
- Classificação: item de consumo ou equipamento
- Suporte a produtos fracionados (com cálculo automático de desconto)
- Produtos para venda (ex.: joias de piercing) vs. suprimentos de consumo

**Entradas:**
- Registro de compras com quantidade e preço unitário
- Dados de fornecedor, validade e lote
- Função "Abastecer" via listas de compras

**Saídas:**
- Registro via QR Code durante procedimentos (leitura de produto)
- Registro manual
- Atualização automática de saldo
- Ajustes rápidos (+/-) com log de alterações

**Kits de procedimentos:**
- Agrupamento de múltiplos produtos em kit
- Desconto automático do estoque ao aplicar kit em procedimento

**Distribuição a profissionais:**
- Rastreamento de materiais entregues a cada tatuador
- Registro de saída vinculado ao profissional

**Listas de compras:**
- Criação nomeada com datas
- Status por item

**Relatórios de estoque:**
- Análise de utilização por período e profissional
- Monitoramento de consumo e custos

---

### Módulo 7 — Profissionais / Equipe

**Funcionalidades confirmadas:**
- Cadastro de profissionais (tatuadores e outros)
- Configuração de comissão por profissional (padrão geral ou por serviço)
- Assinatura digital do profissional (usada nas fichas de anamnese)
- Vinculação de Calendar ID do Google (para sincronização individual)
- Portfólio de artista (não detalhado nas fontes — mencionado na página principal)
- Controle de acesso por perfil (não detalhado)
- Relatório de performance por profissional

---

### Módulo 8 — Serviços / Comanda

**Funcionalidades confirmadas:**
- Cadastro de serviços prestados (tatuagem, piercing, outros)
- Comanda integrada: combina serviços + venda de produtos em um único atendimento
- Gestão de piercing como serviço + produto (joia) simultaneamente
  - Venda de joia registrada no estoque
  - Comissões diferenciadas para serviço e venda
- Categorias financeiras para os serviços
- Controle de sessão (mencionado como categoria no Help Center)

---

### Módulo 9 — Marketing e Comunicação

**WhatsApp — Múltiplas integrações:**

1. **Multichat com WhatsApp + IA (recurso principal)**
   - Interface de atendimento multicanal dentro do GestãoInk
   - IA responde, agenda e registra orçamentos automaticamente
   - "Atende clientes enquanto você tatua"
   - Integração de conversas no histórico do cliente
   - Detalhes do modelo de IA usado: não confirmados nas fontes

2. **WhatsApp por comando (para profissionais)**
   - Número: (47) 98870-2749
   - Profissional envia mensagens no formato: "agendar, cliente, whatsapp, data, hora, valor, obs"
   - Consulta de agenda: "minha agenda, hoje" / "minha agenda, semana" / "minha agenda, DD/MM/AA"
   - Funcionalidades adicionais (financeiro, estoque via WhatsApp) em desenvolvimento

3. **Disparo em massa / Bulk Messaging**
   - Integração com Z-API (configuração via "Meu Estúdio > Configurações > Z-API")
   - Segmentações disponíveis:
     - Por tags/etiquetas de cliente
     - Contatos que não responderam orçamentos
     - Aniversariantes
   - Menu de campanha: "Divulgação"
   - Aviso: plataforma alerta contra envio simultâneo massivo (risco de bloqueio do número)
   - Integração alternativa com Apizap.space (da mesma empresa — gratuito para assinantes)
     - Apizap = "Google Analytics para WhatsApp" (tracking UTM, analytics de conversas)
     - Plano Apizap normal: R$ 99/mês por número conectado
     - Para assinantes GestãoInk: gratuito

4. **Automações de cicatrização via WhatsApp**
   - Mensagens automáticas nos dias 5, 15, 30 e 60 pós-sessão

**Email Marketing:**
- Integração com Mailrelay (requer conta e API key do Mailrelay)
- Configuração via "Configurações > Integrações"
- Grupos de contato: cadastros padrão e solicitações de orçamento
- Automações disponíveis:
  - Boas-vindas para novos cadastros
  - Envio automático de proposta para solicitações de orçamento
  - Newsletter
  - Lembretes de cuidados pós-tatuagem

**Marketing e Promoções (categoria no Help Center):**
- 4 artigos documentados (conteúdo específico não extraído)
- Promoções e campanhas (detalhes não confirmados)
- Programa de indicação com benefícios para clientes

---

### Módulo 10 — Automações e Integrações

**Integrações confirmadas:**
| Integração | Tipo | Detalhes |
|-----------|------|---------|
| Google Calendar | Bidirecional | Sincronização por profissional, exclusão de calendários indesejados |
| WhatsApp (Z-API) | Bulk messaging | Configurado via credenciais Z-API no painel |
| Apizap.space | Analytics WhatsApp | Da mesma empresa; gratuito para assinantes |
| Mailrelay | Email marketing | Requer conta Mailrelay + API key |
| Make | Automações personalizadas | Via API REST do GestãoInk |
| n8n | Automações personalizadas | Via API REST do GestãoInk |
| Maquininhas de cartão | Pagamento | PagSeguro, SumUp, Ton (confirmadas) |

**API pública:**
- Endpoint base: https://gestaoink.tech/api/
- Documentação: https://gestaoink.tech/api/swagger-ui.html
- Autenticação: Bearer token (gerado em "Configurações > Preferências do Sistema > aba API")
- Endpoints identificados:
  - GET /api/agenda/ — listar agendamentos
  - POST /api/agenda/ — criar agendamento
  - PUT /api/agenda/{id} — atualizar agendamento
  - (outros endpoints prováveis para clientes, orçamentos, financeiro — não confirmados na fonte)

---

## App Mobile

**Status:** Não confirmado como app nativo (iOS/Android). Nenhuma referência encontrada na App Store, Play Store ou no site oficial.

**Hipótese mais provável:** A plataforma funciona como PWA (Progressive Web App) ou web responsiva acessível via browser mobile, dado que:
- É descrita como "100% online" e "multidispositivo"
- Não há menção a "baixe o app" ou links para lojas de aplicativos em nenhuma fonte pesquisada
- A integração via WhatsApp por comando sugere que o acesso mobile é via navegador ou via WhatsApp

**Confirmação necessária:** Acesso direto ao dashboard mobile ou confirmação do próprio suporte.

---

## Portal do Cliente

**Status:** Parcialmente confirmado.

- Existe um link de agendamento online enviável ao cliente
- Existe formulário de orçamento online com link personalizado por estúdio
- A ficha de anamnese é preenchida pelo cliente via link compartilhável
- Não há evidência de um "portal do cliente" unificado com login próprio, histórico e acompanhamento de projetos centralizado

---

## Stack Técnica

### Backend
- **Linguagem principal: PHP** (confirmado — arquivo `recuperacao.php` identificado na URL de recuperação de senha)
- **Framework backend:** Não confirmado (possíveis: Laravel, Symfony, ou framework próprio)
- **API:** REST com documentação OpenAPI/Swagger (Swagger UI em gestaoink.tech/api/swagger-ui.html)
- **Autenticação API:** Bearer token

### Frontend
- **Framework:** Não detectado diretamente (a Yggra usa Vue.js, Nuxt.js e React em seus projetos — qualquer um é candidato)
- **Indícios visuais:** Interface moderna com dashboard, Kanban — típico de SPA (Single Page Application)
- **Tipo de aplicação:** Provavelmente SPA (sem SSR detectado), possivelmente PWA dado acesso multidispositivo

### Banco de dados
- **MySQL** (declarado pela Yggra como banco principal com "otimização para ambientes de alta carga")

### Infraestrutura
- **Hospedagem: AWS** (confirmado — site menciona "parceria com AWS"; Yggra usa AWS com CI/CD, monitoramento e auto-scaling)
- **Domínio principal:** gestaoink.tech (dashboard/API)
- **Blog:** WordPress (blog.gestaoink.site — estrutura de URLs e categorias típicas do WP)
- **Help Center:** Tawk.to (gestoink.tawk.help — plataforma de suporte terceirizada)
- **Base de conhecimento:** Intercom ou Helpscout (aprender.gestaoink.com — não confirmado a plataforma)

### Segurança e Compliance
- **LGPD:** Conformidade declarada; dados armazenados de acordo com LGPD
- **Política de Privacidade:** Disponível em PDF
- **Termos de Uso:** Referenciados no site
- **Assinatura digital:** Implementada na anamnese (tecnologia não especificada)

### Integrações técnicas de pagamento
- PagSeguro (confirmada menção)
- SumUp (confirmada menção)
- Ton (confirmada menção)
- Registro de PIX (manual, não automático via webhook de banco)
- Emissão NFS-e integrada (integração com prefeituras — tecnologia não especificada)

---

## Avaliações e Feedback de Usuários

### Depoimentos do próprio site (marketing — considerar com ressalva)
- "Desde que implementei o GestãoInk, meu faturamento aumentou 35%" (em 6 meses)
- "Aumento de conversão de orçamentos superior a 40%"
- "Organização de orçamentos e agendamentos transformou o negócio"
- Menção a satisfação de cliente e monitoramento de cicatrização como diferenciais

### Reclamações identificadas (pesquisa web)
- **Suporte deficiente:** Um relato de usuário que pagou plano anual e reportou que o suporte "só aparece quando está próximo do vencimento e depois some". Queixa de dependência do desenvolvedor para resolver problemas. *(Fonte: mencionado em resultado de busca — não localizado no Reclame Aqui diretamente, pode ser de concorrente ou de fonte não confirmada)*
- **SMS com falha:** Menção a funcionalidade de SMS que não funcionava. *(não confirmado — pode ser recurso descontinuado)*
- **Problemas de agenda:** Relato de "falhas constantes na agenda". *(não confirmado com detalhes)*

### Presença em plataformas de review
- **Reclame Aqui:** Perfil do GestãoInk não encontrado (pode estar ausente ou listado diferente)
- **Capterra:** Não encontrado listado
- **G2:** Não encontrado listado
- **Trustpilot:** Não pesquisado

### Métricas de mercado
- 1.000+ estúdios usando a plataforma (declarado pelo próprio GestãoInk)
- YouTube canal com conteúdo educacional ativo

---

## Pontos Fortes

1. **Verticalização total para tatuagem:** Único sistema pesquisado com funcionalidades específicas como monitoramento de cicatrização (5/15/30/60 dias), controle de sinal de reserva, kits de procedimento, gestão de anamnese com alertas por gravidade
2. **Orçamentos como CRM:** Pipeline Kanban de orçamentos é diferencial relevante — transforma o caos de DMs no WhatsApp em processo estruturado
3. **WhatsApp nativo:** Integração profunda com WhatsApp (bulk messaging, IA de atendimento, agendamento por comando, automação de follow-up) é ponto forte para mercado brasileiro
4. **Ecossistema próprio:** Apizap.space (analytics de WhatsApp) da mesma empresa, grátis para assinantes — cria lock-in e valor adicional
5. **Estoque específico para tatuagem:** QR code de saída de material durante procedimento, kits de procedimento, controle de joias de piercing separado de suprimentos
6. **Ficha de anamnese robusta:** Alertas automáticos por gravidade, assinatura digital automática de profissional — resolve questão jurídica/compliance do setor
7. **Comissões flexíveis:** Dois modelos de repasse (estúdio→artista e artista→estúdio) com comprovantes PDF — atende diferentes modelos de negócio
8. **Plano vitalício:** Opção de R$ 8.000 única vez pode ser atrativo para estúdios estabelecidos
9. **Trial de 5 dias sem cartão:** Reduz fricção de onboarding
10. **API aberta com Swagger:** Permite integrações customizadas via Make/n8n

---

## Pontos Fracos / Gaps

1. **Sem app mobile nativo:** Plataforma parece ser web-only (sem app iOS/Android confirmado), enquanto o mercado espera app mobile nativo para tatuadores em movimento
2. **Sem portal unificado do cliente:** Não há área de login para o cliente acompanhar projetos, histórico, cicatrização, agendamentos futuros — tudo é feito por links avulsos
3. **Suporte questionável:** Relatos de suporte desaparecendo após pagamento anual; dependência do desenvolvedor para bugs críticos
4. **Sem integração com PIX automático:** Confirmação de pagamento via PIX é manual (sem webhook bancário automático)
5. **SMS com falhas (não confirmado):** Menção a SMS que não funcionava — funcionalidade pode estar descontinuada
6. **Sem listagem em marketplaces de software:** Ausente no Capterra, G2, Reclame Aqui — dificulta avaliação independente e reduz confiança
7. **Fundadores/empresa anônimos:** Nenhuma informação pública sobre quem fundou, equipe, histórico — dificulta confiança institucional
8. **Preços com discrepâncias:** Duas tabelas de preços diferentes encontradas em fontes distintas sem esclarecimento no site — falta de transparência
9. **Email marketing via integração terceira:** Requer conta separada no Mailrelay em vez de funcionalidade nativa
10. **WhatsApp bulk com risco de bloqueio:** Plataforma alerta sobre bloqueio de número pelo WhatsApp ao fazer disparos em massa — limitação estrutural do canal
11. **Concorrência internacional não monitorada:** GestãoInk não aparece nas listas de melhores softwares de tatuagem em comparativos globais (Capterra, artigos internacionais citam outros produtos)
12. **Documentação de API limitada:** Apenas endpoint de agenda confirmado na documentação — possível falta de cobertura completa da API

---

## O que Replicar para um Sistema Similar

### Funcionalidades de alto valor a replicar (validadas pelo mercado):

**Core diferenciador:**
1. **Pipeline Kanban de orçamentos** com formulário online personalizado e captura automática de leads via WhatsApp — resolve a maior dor do mercado (perda de clientes por falta de organização de DMs)
2. **Monitoramento de cicatrização automatizado** (5/15/30/60 dias) com notificações WhatsApp — funcionalidade única de retenção e cuidado pós-venda
3. **Ficha de anamnese digital** com alertas por gravidade, assinatura automática e arquivo digital — elimina papel e resolve compliance jurídico
4. **Controle de sinal/depósito** integrado ao agendamento — gestão de fluxo de caixa específica para o modelo de negócio da tatuagem
5. **Kits de procedimento** vinculados ao estoque — baixa automática de múltiplos itens em uma sessão

**Comunicação:**
6. **Automações WhatsApp por fase** (pré-sessão, pós-sessão, aniversário, cicatrização) — manter cliente engajado sem trabalho manual
7. **Agendamento online via link** enviável para o cliente — reduz ligações e DMs
8. **Integração Google Calendar** por profissional — essencial para equipes com múltiplos artistas

**Operacional:**
9. **Dois modelos de comissão** (estúdio paga / artista repassa) com comprovante PDF — atende todos os modelos de parceria
10. **Comanda unificada** (serviço + produto) para piercing — amplia mercado atendido
11. **QR Code de baixa de estoque** durante procedimento — reduz esquecimento de registrar consumo

**O que fazer MELHOR que o GestãoInk:**
1. **App mobile nativo** (iOS + Android) — gap crítico identificado
2. **Portal do cliente com login** — histórico, projetos, cicatrização, agendamentos futuros em um lugar só
3. **PIX automático** via webhook bancário (Open Finance/Pix Dinâmico)
4. **Presença em marketplaces** (Capterra, G2) para credibilidade institucional
5. **Transparência de fundadores** e equipe no site — constrói confiança
6. **Email marketing nativo** (sem depender do Mailrelay externo)
7. **Suporte com SLA definido** — maior reclamação dos usuários identificados
8. **Documentação pública de API completa** — não só agenda mas todos os módulos

---

## Referências e Fontes

- Site principal: https://gestaoink.site/
- Blog: https://blog.gestaoink.site/
- Base de conhecimento: https://aprender.gestaoink.com/
- Help Center: https://gestoink.tawk.help/
- API Swagger: https://gestaoink.tech/api/swagger-ui.html
- Desenvolvedor: https://yggra.com.br/
- Análise externa: https://tripod.com.br/gestaoink-software-de-gestao-para-estudios-de-tatuagem/
- Estoque detalhado: https://blog.gestaoink.site/controle-de-estoque-no-gestaoink-guia-completo-para-materiais-e-suprimentos/
- WhatsApp bulk: https://blog.gestaoink.site/disparo-em-massa-whatsapp-com-gestaoink-para-estudios-de-tatuagem/
- Email marketing: https://blog.gestaoink.site/email-marketing-para-tatuadores-e-seus-estudios/
- API e integrações: https://blog.gestaoink.site/os-beneficios-da-api-em-sistemas-de-gestao-para-estudios-de-tatuagem/
- Anamnese: https://blog.gestaoink.site/a-ficha-de-anamnese-do-gestaoink-a-mais-completa-do-mercado/
- Financeiro: https://blog.gestaoink.site/setup-financeiro-para-o-sucesso-de-estudios-e-tatuadores-em-2025/
- Piercing: https://blog.gestaoink.site/como-fazer-a-gestao-de-servico-e-venda-de-joias-de-piercing-no-gestaoink/
- Apizap: https://apizap.space/
