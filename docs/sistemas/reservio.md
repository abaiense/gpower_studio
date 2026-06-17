# Reservio — Análise Completa

> Documento de pesquisa técnica de produto. Data: 2026-06-15.
> Fontes: site oficial, help center, GitHub, G2, Capterra, FinancesOnline, SoftwareSuggest, LinkedIn, artigos de blog, vagas de emprego, registros corporativos.
> Itens marcados com `(não confirmado)` são inferências baseadas em evidências indiretas.

---

## Visão Geral

Reservio é um software de agendamento online horizontal (SaaS) voltado para negócios de serviços. Permite que clientes façam reservas 24/7 e que negócios gerenciem calendários, equipes, pagamentos e relacionamento com clientes em uma única plataforma.

**Proposta de valor central:** "Simplify online scheduling, client management and payments with an online platform, made for any type of business."

**Números públicos (2024–2025):**
- 500.000 negócios atendidos (dado do site oficial, antes indicava 300.000)
- 20 milhões de reservas por ano
- 21 milhões de clientes já fizeram reservas
- Presença em mais de 130 países
- 23 funcionários (dado do About Us)
- App Store: 4.8/5 | Google Play: 4.5/5 | Capterra: 4.6/5 (142 avaliações) | G2: 4.5/5

---

## História e Empresa

### Fundação
- **Fundado em:** 2013
- **Fundadores:** Boris Bošiak (CEO) e František Mazuch (Co-fundador e CTO)
- **Sede:** Brno, República Tcheca (South Moravian Region)
- **Razão social:** Reservio, s.r.o.
- **CNPJ equivalente (CZ):** Empresa registrada em 06 de novembro de 2012 (data de constituição jurídica)

### Timeline de Evolução

| Ano | Marco |
|-----|-------|
| 2012 | Constituição jurídica da empresa; vitória no acelerador StarCube |
| 2013 | Lançamento da plataforma com formulário de agendamento online; línguas: tcheco, eslovaco, inglês |
| 2013 | Investimento estratégico da Webnode (startup de Brno, criadora de sites) |
| 2015 | Expansão internacional: Espanha, Brasil, Itália, França, Países Baixos |
| 2018 | Lançamento dos apps mobile Android e iOS para gestão de negócios |
| 2019 | Lançamento do marketplace Reservio (busca de negócios por área) na Europa Central; app mobile para clientes |
| 2020 | Integração de pagamentos online (primeiros passos) |
| 2020 | 70% das instalações de testagem de COVID-19 na República Tcheca usaram o Reservio — pivô para saúde e serviços públicos |
| 2024 (março) | Lançamento do sistema POS (beta) |
| 2024 (setembro) | Lançamento de pagamentos online em toda a Europa |
| 2024 (outubro) | Entrada no grupo ABUGO Holding |
| 2024 | Expansão para mercados escandinavos (sueco, dinamarquês, finlandês) |

### ABUGO Holding (2024)
Em outubro de 2024, a Reservio se uniu ao grupo **ABUGO**, o maior holding de SaaS da Europa Central, ao lado de:
- **Shopsys** — plataforma de e-commerce
- **Smartsupp** — live chat e chatbots
- **Survio** — software de pesquisas/surveys

CEO do grupo: Petr Svoboda. Receita total do holding: ~300 milhões de coroas tchescas (~13 milhões de dólares). Gestão descentralizada — cada empresa mantém sua direção independente.

### Financiamento
- Primeiro investimento identificado: participação acionária da **Webnode** em 2013
- Classificação atual: **bootstrapped / investimento privado** (sem rodadas de VC públicas identificadas)
- Parte do ABUGO Holding como estrutura corporativa

---

## Modelo de Negócio

- **Tipo:** SaaS (Software as a Service), baseado em nuvem
- **Modelo de receita:** Assinatura mensal/anual em camadas + add-ons (SMS, branded app)
- **Segmentos atendidos:** Solo (autônomos), Team (pequenas equipes), Multi-location (redes), Enterprise (grandes organizações)
- **Distribuição:** Self-service (cadastro gratuito sem cartão de crédito) + vendas enterprise via contato comercial

---

## Planos e Preços

### Planos Padrão (B2B — negócios)

| Plano | Preço (mensal) | Reservas/mês | Clientes | Destaque |
|-------|---------------|-------------|----------|----------|
| **Free** | $0 | 40 | 100 | Essencial para começar |
| **Starter** | $10/mês | 200 | Ilimitados | Mais popular — sinc. calendário, estatísticas |
| **Standard** | $20/mês | 500 | Ilimitados | Passes, memberships, domínio próprio, notif. staff |
| **Pro** | $40/mês | Ilimitados | Ilimitados | API, sem branding Reservio, controle de acesso |
| **Enterprise** | Sob consulta | Ilimitados | Ilimitados | Multi-localização, app branded, SLA, suporte dedicado |

**Notas de preços:**
- Planos anuais incluem 1 mês grátis (equivale a ~16% de desconto)
- Contrato mínimo de 6 meses (segundo fontes de terceiros)
- Garantia de devolução em 15 dias
- SMS cobrado por crédito separadamente (preço varia por país)
- Taxas de pagamento online (Adyen, não Stripe):
  - Free: 3,00% + $2,55 por transação
  - Starter: 1,89% + $2,55
  - Standard: 1,39% + $2,55
  - Pro: 1,19% + $2,55

### Add-ons Identificados
- **Branded App (app com marca própria):** cobrança mensal adicional (valor não divulgado publicamente)
- **SMS:** pacotes de créditos comprados separadamente
- **Desenvolvimento customizado:** cotação sob demanda (enterprise)

### O que cada plano inclui/exclui (principais diferenças)

| Funcionalidade | Free | Starter | Standard | Pro |
|---------------|------|---------|----------|-----|
| Booking Website | Sim | Sim | Sim + design custom | Sim + sem branding |
| Sincronização Google/Outlook/iCal | Não | Sim | Sim | Sim |
| Estatísticas e relatórios | Não | Sim | Sim | Sim |
| Passes e memberships | Não | Não | Sim | Sim |
| Domínio personalizado | Não | Não | Sim | Sim |
| Notificações personalizáveis | Não | Não | Sim | Sim |
| Notificações para staff | Não | Não | Sim | Sim |
| API access | Não | Não | Não | Sim |
| Controle de acesso (roles) | Não | Não | Não | Sim |
| Remover branding Reservio | Não | Não | Não | Sim |
| SMS reminders | Add-on | Add-on | Add-on | Add-on |

---

## Funcionalidades Completas

### 1. Sistema de Calendário e Agendamento

**Tipos de calendário:**
- **Meeting Calendar** — agendamentos individuais (1 cliente por vez, por profissional)
- **Lesson Calendar** — eventos em grupo (múltiplos clientes simultâneos em uma aula/classe)

**Visões do calendário:**
- Por dia, semana, mês
- Filtro por funcionário, serviço, tipo
- Visão multi-staff (todos os profissionais em colunas paralelas)

**Tipos de agendamento suportados:**
- Consultas/serviços individuais
- Aulas e eventos em grupo com capacidade máxima configurável
- Agendamentos recorrentes
- Pausas e intervalos configuráveis
- Bloqueio de horários (férias, indisponibilidade)
- Agendamentos avulsos e por período

**Funcionalidades do calendário:**
- Drag and drop para reagendar (não confirmado — inferido da interface)
- Time-zone management (suporte a fusos horários diferentes)
- Buffer time entre agendamentos (tempo de preparação)
- Criação rápida de reservas pelo painel (sem necessidade do cliente)
- Checkin/checkout — marcação de presença/ausência
- Rastreamento de no-shows

**Gestão de disponibilidade:**
- Horários de trabalho configuráveis por funcionário
- Dias de folga e feriados bloqueados automaticamente
- Disponibilidade em tempo real refletida na página pública
- Rastreador de férias por colaborador

---

### 2. Página de Agendamento Pública (Booking Website)

Cada negócio recebe um site de agendamento público com URL própria no domínio `reservio.com` (ex: `reservio.com/business/nome-do-negocio`).

**Customização disponível:**
- Layout do cabeçalho (múltiplos designs pré-definidos) — planos Standard e Pro
- Tema de cores (seleção de paletas ou cores personalizadas via código hex) — Standard e Pro
- Foto de capa
- Visibilidade de seções: Serviços, Eventos, Equipe, Avaliações, Sobre nós
- Ordem das seções (drag and drop)
- Imagens específicas por serviço
- Descrições de serviços e eventos
- Planos Free e Starter: apenas controle de quais seções são visíveis

**Domínio personalizado:**
- Disponível no plano Standard e Pro
- Permite vincular domínio próprio ao Booking Website

**Fluxo do cliente para agendar (passo a passo):**
1. Acessa o Booking Website (link, QR code, widget no site, ou busca no marketplace)
2. Seleciona o serviço desejado
3. Escolhe o profissional (ou "qualquer disponível")
4. Seleciona data e horário disponíveis
5. Preenche dados pessoais (nome, email, telefone)
6. Seleciona forma de pagamento (se habilitado: online / passes / presencial)
7. Confirma a reserva
8. Recebe email de confirmação imediatamente

**Recursos adicionais:**
- QR codes gerados automaticamente para compartilhamento
- Booking Link direto para um serviço, profissional ou horário específico
- Suporte a múltiplos idiomas conforme configuração do negócio
- Reviews e avaliações de clientes visíveis na página (não confirmado — funcionalidade listada mas não detalhada)

---

### 3. Widget e Formulário de Agendamento (Embed)

Três métodos de integração com sites externos:

**a) Botão "Book Now":**
- Código HTML gerado pelo Reservio
- Texto e design do botão personalizáveis
- Ao clicar, abre o Booking Website do negócio
- Compatible com: WordPress, Joomla, Drupal, Shopify, WooCommerce, Squarespace, Wix, Magento, GoDaddy, Weebly, Sitefinity, Webnode e qualquer HTML

**b) iFrame:**
- Exibe preview dos serviços diretamente no site do cliente
- Clientes selecionam e confirmam sem sair da página
- Código `<iframe>` personalizado gerado

**c) API personalizada:**
- Apenas no plano Pro
- Permite criar experiência de agendamento 100% customizada
- Dados do Reservio integrados ao site/app do negócio

---

### 4. Lembretes e Notificações Automáticas

**Canal: Email (gratuito em todos os planos)**
- Comprimento ilimitado de texto
- Inclui botão de cancelamento direto no email
- Entregabilidade reportada: 84%
- Remetente pode ser personalizado (planos Standard e Pro)

**Canal: SMS (pago por créditos, todos os planos premium)**
- Taxa de abertura: 98%
- 90% lidos em até 3 minutos (dado interno Reservio)
- Créditos comprados separadamente (preço por país)
- Template personalizável (Standard e Pro)

**11 tipos de mensagens automáticas:**

Para clientes (7 tipos):
1. Reserva aguardando aprovação
2. Confirmação de reserva
3. Reserva recusada
4. Cancelamento de reserva
5. Reagendamento
6. Lembrete de agendamento (configurável: quantas horas/dias antes)
7. Solicitação de feedback pós-visita

Para staff/admin (4 tipos):
1. Nova reserva confirmada
2. Cancelamento de reserva
3. Reserva aguardando aprovação
4. Notícias e dicas internas

**Configuração:** Settings > Automation > Messages
- Ativar/desativar por tipo de mensagem
- Configurar timing dos lembretes (ex: 24h antes, 1h antes)
- Templates padrão ou personalizados (Standard/Pro)
- Personalização com nome do cliente via variáveis

**Resultados reportados:**
- Redução de 75% em reservas perdidas (dado do blog oficial)
- Aumento de 30% no lucro (dado do blog oficial)

---

### 5. Gestão de Equipe (Multi-profissional)

**Roles/Permissões (plano Pro — multi-level access):**
- **Admin:** acesso total ao sistema
- **Manager:** gerencia calendários, clientes, relatórios (não configurado o financeiro — não confirmado)
- **Staff Member:** acessa apenas seu próprio calendário e reservas

**Por funcionário:**
- Calendário individual com horários de trabalho próprios
- Foto de perfil e bio visíveis na página pública
- Configuração de serviços que cada profissional oferece
- Rastreador de férias e ausências
- Recebe notificações de novas reservas (SMS ou email)
- Pode gerenciar suas próprias reservas (configurável)
- Sincronização com calendário pessoal (Google, Outlook, iCal)

**Visão gerencial:**
- Dashboard multi-staff com todos os calendários
- Relatório de produtividade por funcionário (reservas e receita projetada)
- Turnos e escalas gerenciados centralmente

**Notificações para staff:**
- Disponível a partir do plano Standard
- SMS ou email quando nova reserva é criada, cancelada ou alterada

---

### 6. Sincronização de Calendário

**Plataformas suportadas (Starter, Standard, Pro):**
- **Google Calendar:** sincronização bidirecional — eventos do Reservio aparecem no Google Calendar e bloqueios no Google bloqueiam horários no Reservio
- **Microsoft Outlook:** sincronização (direção não totalmente especificada — `não confirmado` se bidirecional)
- **Microsoft Exchange:** sincronização unidirecional
- **iCal / ICS:** exportação de eventos via formato padrão iCalendar
- **Google Contacts:** importação/exportação de contatos

**Como funciona:**
1. Na área de configurações do perfil do funcionário, conecta-se a conta Google/Outlook
2. O sistema sincroniza automaticamente
3. Agendamentos no Reservio bloqueiam o horário no Google Calendar do profissional
4. Eventos externos no Google Calendar (marcados como "busy") bloqueiam disponibilidade no Reservio

**Plano Free:** sem sincronização de calendário externo

---

### 7. Pagamentos Online

**Gateway principal:** **Adyen** (não Stripe, como frequentemente citado em fontes de terceiros — confirmado pela documentação oficial)

**Métodos aceitos:**
- Cartões de crédito e débito (Visa, Mastercard, etc.)
- Apple Pay
- Google Pay
- Maestro
- Carte Bancaire (França)
- Dankort (Dinamarca)
- Bancontact (Bélgica)
- E-wallets diversas

**Disponibilidade geográfica:**
- Maioria dos países europeus (lista completa no help center)
- Brasil e América Latina: disponibilidade não confirmada publicamente

**Funcionalidades de pagamento:**
- Pagamento total no momento da reserva
- Pagamento parcial (depósito/entrada) no momento da reserva
- Pagamento presencial no momento do serviço
- Reembolso automático em cancelamentos
- Prevenção de no-shows (cliente pré-paga)
- PCI DSS Level 1 compliant (através do Adyen)
- Recibos digitais automáticos

**Taxas (por plano):**
- Free: 3,00% + $2,55
- Starter: 1,89% + $2,55
- Standard: 1,39% + $2,55
- Pro: 1,19% + $2,55

**POS (presencial) — lançado em 2024 (beta):**
- Aceita: dinheiro, cartões de fidelização, e-wallets
- Cartões de débito/crédito via terminal físico: **previsto para 2026** (em desenvolvimento)
- Inventário sincronizado com vendas em tempo real

---

### 8. Sistema POS (Point of Sale)

Lançado em março de 2024 (beta). Integração nativa com o sistema de agendamento.

**Funcionalidades:**

*Checkout:*
- Processamento de transações na nuvem
- Pagamentos combinados (serviço + produto em uma transação)
- Faturas e recibos digitais automáticos
- Faturas personalizáveis (logo, dados do negócio)
- Gestão de alíquotas de imposto por produto/serviço
- Cálculo automático de taxas

*Gestão de Inventário:*
- Cadastro de produtos com preço, categoria, quantidade
- Atualização em tempo real após cada venda
- Alertas de estoque baixo
- Intake em massa (para grandes pedidos de fornecedores)
- Stocktaking simplificado
- Exportação de dados para contabilidade

*Integração com agendamento:*
- Na saída, profissional pode registrar produtos vendidos (ex: shampoo após corte)
- Sistema calcula total (serviço + produtos)
- Cliente pode agendar próxima visita com pagamento antecipado no mesmo momento
- Histórico de compras integrado ao perfil do cliente

**Planos de expansão:**
- Integração com terminal físico de cartão: previsto para 2026

---

### 9. Gestão de Clientes (CRM)

**Perfil do cliente contém:**
- Dados de contato (nome, email, telefone)
- Histórico completo de visitas e reservas
- Notas livres sobre o cliente (anotações do profissional)
- Passes e memberships atribuídos
- Marcação de no-show (flag para clientes que não aparecem)
- Histórico de compras (via POS)

**Base de dados:**
- Plano Free: até 100 clientes
- Planos pagos: ilimitado
- Importação via CSV (lista de clientes existentes)
- Exportação em CSV e PDF

**Segmentação:**
- Busca e filtros na base de clientes
- Segmentação básica por comportamento (não confirmado — inferido das funcionalidades de relatórios)

**Comunicação:**
- Envio de mensagens automáticas personalizadas com nome do cliente
- Integração com email marketing (Mailchimp, SendInBlue, GetResponse, AWeber) via exportação de contatos

---

### 10. Programas de Fidelidade (Passes e Memberships)

Disponível a partir do plano Standard.

**Três tipos de passes:**

**a) Credit Pass (Passe de Crédito):**
- Define valor em dinheiro (ex: R$100)
- A cada serviço, o valor é deduzido automaticamente
- Saldo restante disponível para futuras reservas
- Pode ter data de expiração

**b) Visit Pass (Passe de Visitas / Cartão Fidelidade):**
- Define número de visitas (ex: 10 aulas)
- A cada serviço, uma visita é consumida
- Pode ter data de expiração
- Equivale ao modelo "carimbo" de fidelidade

**c) Time Pass (Membership / Assinatura por Tempo):**
- Define período de validade (ex: 1 mês)
- Acesso ilimitado a serviços no período
- Ideal para academias, estúdios de yoga, pilates
- Renovação manual ou automática (não confirmado)

**Como o cliente usa:**
- No último passo do checkout (escolha de pagamento), pode selecionar passe ativo
- Passes podem ser comprados diretamente na Booking Website
- Disponíveis também via POS presencial

**Gift Cards / Vouchers:**
- Mencionados como funcionalidade — detalhes de implementação não totalmente confirmados

---

### 11. App Mobile para Negócios (Reservio Business)

Disponível para iOS e Android. Gratuito para usuários do Reservio.

**Funcionalidades do app:**
- Visualização e gestão do calendário
- Criar, editar, cancelar reservas
- Checar lista de clientes do dia
- Notificações push para novas reservas
- Acesso ao perfil e histórico de clientes
- Registrar presença/ausência de clientes
- Gestão básica de equipe
- Acesso a estatísticas/relatórios
- POS (checkout e inventário via app — não confirmado se totalmente funcional no mobile)

**Notas:**
- App desenvolvido em **React Native** (confirmado via perfil LinkedIn de desenvolvedor senior da empresa)
- Há dois apps distintos: um para negócios (Reservio Business) e um para clientes

---

### 12. App Mobile para Clientes

Lançado em 2019, disponível em iOS e Android.

**Funcionalidades:**
- Buscar negócios próximos (marketplace)
- Ver disponibilidade em tempo real
- Fazer e gerenciar reservas
- Histórico de agendamentos
- Ver passes e saldo de memberships
- Notificações in-app sobre reservas
- Pagamento online via app

**Nota:** Menos documentado publicamente que o app para negócios. Pode não estar disponível em todos os países.

---

### 13. Branded App (App com Marca Própria)

Solução white-label onde o Reservio cria um app com a identidade visual do negócio.

**Como funciona:**
1. Negócio envia logo, cores e elementos visuais para o Reservio
2. Equipe do Reservio cria o design e envia para aprovação
3. App é publicado na App Store e Google Play com o nome da marca do negócio

**Funcionalidades do app branded (as mesmas do app de clientes):**
- Agendamentos de serviços, aulas, eventos
- Pagamento online integrado
- Perfil do cliente com histórico
- Programa de fidelização (passes e memberships)
- Notificações push gratuitas (in-app)
- iOS e Android

**Custo:** Mensalidade adicional (valor não divulgado publicamente — contato comercial necessário)
**Disponível em:** Todos os planos (na prática, enterprise/Pro — não confirmado limitação por plano)

**Vantagem:**
- Notificações push gratuitas (vs. SMS que são pagas)
- Fortalecimento de marca
- Relacionamento exclusivo com clientes

---

### 14. Relatórios e Analytics

Disponível nos planos Starter, Standard e Pro (não no Free).

**Relatórios disponíveis:**

| Relatório | O que mostra |
|-----------|-------------|
| Número de reservas | Total, por período, comparativo semanas/meses |
| Cancelamentos e no-shows | Quantidade e % por período |
| Utilização do calendário | % de capacidade ocupada |
| Novos vs. recorrentes | % de clientes novos vs. fiéis |
| Fonte das reservas | Via calendário interno / Booking Website / Widget/iFrame |
| Por funcionário | Reservas e receita projetada por profissional |
| Por serviço | Reservas e receita por tipo de serviço |
| Passes emitidos | Quantidade de passes atribuídos a clientes |

**Filtros:**
- Por período customizado (data de início e fim)
- Comparativo entre períodos

**Exportação:**
- CSV de todos os agendamentos do período selecionado
- PDF (mencionado para lista de clientes)

**Integração externa:**
- **Google Analytics:** rastreamento de comportamento no Booking Website
- **Meta Pixel:** rastreamento de conversões para anúncios Facebook/Instagram
- **Google Ads:** rastreamento de conversões
- **Sklik:** plataforma de anúncios tcheca

**ELK Stack (interno):** Elasticsearch + Logstash + Kibana para logs e monitoramento de infraestrutura (não para usuários finais)

---

### 15. Integrações

**Calendário:**
- Google Calendar (bidirecional)
- Microsoft Outlook
- Microsoft Exchange (unidirecional)
- iCal / ICS
- Google Contacts

**CMS e construtores de site:**
- WordPress (plugin oficial)
- Joomla
- Drupal
- Shopify / WooCommerce
- Squarespace
- Wix
- Magento
- GoDaddy
- Weebly
- Sitefinity Progress
- Webnode

**Email marketing:**
- Mailchimp
- SendInBlue (Brevo)
- GetResponse
- AWeber

**Analytics e publicidade:**
- Google Analytics
- Meta Pixel (Facebook/Instagram Ads)
- Google Ads
- Sklik

**Redes sociais:**
- Facebook (botão "Book Now" na página do negócio)
- Instagram (link de agendamento no perfil)

**Videoconferência:**
- Zoom: marcado como "Coming soon" (não confirmado se já lançado)

**Automação / Zapier:**
- Integração via Zapier confirmada (conecta com 1000+ apps indiretamente)

**Pagamentos:**
- Adyen (gateway principal para pagamentos online)

**Mensageria:**
- Messente API (envio de SMS — identificado no GitHub)
- Firebase Cloud Messaging (notificações push — identificado no GitHub)

---

### 16. Funcionalidades de Marketing

- **Booking Link:** link direto para serviço específico, profissional específico ou horário específico — compartilhável em WhatsApp, redes sociais, email
- **QR Code:** gerado automaticamente para qualquer serviço ou perfil — imprimível para materiais físicos
- **Botão "Book Now":** embed em qualquer site, Facebook, Instagram
- **Passes e gift cards:** ferramentas de retenção e venda antecipada
- **Email de feedback pós-visita:** solicita avaliação automaticamente após o serviço
- **Meta Pixel / Google Ads:** rastreamento de campanhas pagas
- **Google Analytics:** análise de tráfego na Booking Website
- **Programa de fidelidade:** passes de crédito, visitas e tempo

---

### 17. Gestão Multi-localização (Enterprise)

**Funcionalidades:**
- Cada filial tem calendário próprio e base de clientes independente
- Página de agendamento por filial
- Mapa de localização direciona o cliente para a unidade correta
- Suporte a fusos horários diferentes por localização
- Localização de Booking Website por idioma
- Dashboard centralizado com visão de todas as filiais
- API robusta para integração com sistemas internos

**Clientes enterprise identificados:**
- Kiehl's (cosméticos)
- Notino (perfumaria online)
- Mary Kay
- L'Oréal
- IKEA
- Alessandro (moda)
- E ainda: Nissan, Allianz, Škoda, Oracle, UNICEF (citados na home page, não na página enterprise)

**Precificação enterprise:** Sob consulta (baseada em número de calendários, usuários e funcionalidades necessárias)

---

### 18. Agendamentos em Grupo (Aulas e Eventos)

**Tipos suportados:**
- Aulas presenciais
- Aulas online
- Eventos híbridos
- Eventos internos (organizacionais)

**Configuração por aula/evento:**
- Nome e descrição
- Serviço associado e profissional responsável
- Data, horário e duração
- Capacidade máxima de participantes
- Buffer time entre sessões
- Preço (pode usar passes/memberships)
- Recorrência (aulas semanais fixas — não confirmado detalhes)

**Gestão:**
- Lista de participantes por aula
- Controle de presença/ausência
- Reservas 24/7 até atingir capacidade máxima (lista de espera: não confirmado)
- Lembretes em massa via email/SMS para todos os participantes
- Cancelamento com notificação automática para participantes

---

## App Mobile

### Reservio Business App
- **Plataformas:** iOS e Android
- **Tecnologia:** React Native (confirmado via LinkedIn — desenvolvedor senior responsável por "dois apps React Native usados por dezenas de milhares de usuários ao redor do mundo")
- **Disponibilidade:** Gratuita para todos os planos
- **Principais funções:** Gestão completa de reservas, calendário, clientes, POS mobile

### Reservio (App para clientes)
- **Plataformas:** iOS e Android
- **Tecnologia:** React Native (inferido — mesma equipe e codebase)
- **Disponibilidade:** Gratuito para usuários finais
- **Principais funções:** Busca de negócios, agendamento, gestão de reservas pessoais

### Ratings nas Stores
- App Store: **4.8/5**
- Google Play: **4.5/5**

---

## Integrações

*(Ver seção detalhada em Funcionalidades Completas — item 15)*

**Resumo das categorias:**
1. Sincronização de calendário: Google Calendar, Outlook, Exchange, iCal
2. CMS/construtores de site: WordPress, Wix, Shopify, Squarespace, +8 outros
3. Email marketing: Mailchimp, Brevo, GetResponse, AWeber
4. Analytics/Ads: Google Analytics, Meta Pixel, Google Ads
5. Redes sociais: Facebook, Instagram
6. Pagamentos: Adyen
7. Automação: Zapier (indiretamente)
8. Push notifications: Firebase Cloud Messaging
9. SMS: Messente API
10. Videoconferência: Zoom (em breve)

---

## API e Webhooks

### API REST (Reservio API v2)

**Acesso:** Exclusivo no **plano Pro**. Ativação mediante contato com suporte.

**Documentação:** `https://reservioapiv2.docs.apiary.io/`

**Características:**
- REST API seguindo padrões JSON API (jsonapi.org compliant)
- Endpoints com padrão REST previsível
- Respostas em JSON padrão
- Autenticação segura (mecanismo específico não documentado publicamente — provavelmente API Key ou OAuth2)
- Fair use com limites generosos (rate limits específicos não publicados)

**Casos de uso documentados:**
1. Integração de agendamento online customizado
2. Relatórios customizados e análise de dados
3. Sincronização com sistemas internos (ERP, CRM próprio)
4. Botão de agendamento customizado
5. Embedded iframe customizado
6. Qualquer integração website/app/software personalizado

**Proxy middleware:**
- O GitHub da Reservio mantém `express-http-proxy-async` — middleware Express.js para proxy, sugerindo uso de Node.js/BFF pattern nas integrações

### Webhooks
- Não documentados publicamente (não confirmado se existem)
- Inferência: provável existência dado o uso de RabbitMQ na stack

### Limitações da API
- Disponível apenas no plano mais caro (Pro — $40/mês)
- Ativação manual pelo suporte (não self-service)
- Documentação pública limitada (apenas via Apiary)

---

## Stack Técnica

> Fontes: GitHub oficial da Reservio (github.com/reservio), vaga de emprego PHP (kariera.reservio.com), perfis LinkedIn de funcionários, busca web sobre stack.

### Backend

| Componente | Tecnologia | Fonte de Confirmação |
|-----------|-----------|---------------------|
| Linguagem principal | **PHP** | GitHub (repositórios majoritariamente PHP), vaga de PHP Tech Lead |
| Framework backend | **Nette Framework** | GitHub (múltiplos pacotes Nette integrados) |
| Frameworks adicionais | **Symfony**, **Laravel** | Fontes de terceiros (não confirmado se atual) |
| ORM | **Doctrine 2** | GitHub (repositório `reservio/Doctrine`) |
| Design de API | **REST** + **GraphQL** | Pesquisa de stack (não confirmado qual está em produção) |
| Message queue | **RabbitMQ** | GitHub (integração identificada) |
| Cache | **Redis** | Pesquisa de stack (não confirmado) |
| Search | **ElasticSearch** | Documentação de segurança (ELK Stack para logs) |
| CLI | **Symfony Console** | GitHub (`reservio/Console`) |
| Logging | **Monolog** | GitHub (integrado ao Nette) |
| Arquitetura | **Hexagonal Architecture** + **CQRS** | Pesquisa de stack (não confirmado se atual) |
| Pattern | **BFF (Backend For Frontends)** | Pesquisa de stack (não confirmado se atual) |

### Frontend

| Componente | Tecnologia | Fonte |
|-----------|-----------|-------|
| Framework web | **React** | Pesquisa de stack (mencionado em múltiplas fontes) |
| Framework alternativo | Vue.js (não confirmado) | Perfil LinkedIn de funcionário |
| Mobile | **React Native** | LinkedIn (desenvolvedor senior confirmou dois apps React Native) |

### Infraestrutura

| Componente | Tecnologia | Fonte |
|-----------|-----------|-------|
| Cloud providers | **DigitalOcean**, **AWS**, **Google Cloud** | Documentação de segurança oficial |
| Data centers | Frankfurt, Praga, Brno (Europa) | Documentação de segurança oficial |
| Containerização | **Docker** | Pesquisa de stack |
| Logs | **ELK Stack** (Elasticsearch + Logstash + Kibana) | Documentação de segurança oficial |
| Armazenamento de logs | **Amazon S3** | Documentação de segurança oficial |
| Scanning de vulnerabilidades | **Clair**, **Dependabot** | Documentação de segurança oficial |
| Push notifications | **Firebase Cloud Messaging** | GitHub (`reservio/php-firebase-cloud-messaging`) |
| SMS | **Messente API** | GitHub |
| Pagamentos | **Adyen** | Help center + documentação de segurança |
| Uptime SLA | 99,9%+ | Documentação de segurança oficial |

### Autenticação

- OAuth2 para integração com Facebook (deprecated — pacote no GitHub)
- Autenticação própria para a plataforma
- API key (não confirmado — inferido da documentação do Apiary)

### Segurança e Compliance

| Certificação | Status |
|-------------|--------|
| GDPR | Compliant — inclui formulários de consentimento, direito ao esquecimento, dashboard de gestão de dados |
| LGPD (Brasil) | Compliant — mencionado explicitamente na documentação |
| PCI DSS Level 1 | Compliant — via parceiro Adyen |
| ISO 27001:2013 | Compliant — mencionado na documentação do POS |
| SSL/TLS | Certificado A+ no Qualys SSL Labs |
| Criptografia | 256-bit para todos os dados em trânsito |
| Backups | Diários, múltiplos locais, recuperação em qualquer ponto temporal |
| Failover automático | Sim |
| DAC7 | Mencionado (legislação fiscal europeia para marketplaces) |

---

## Avaliações e Feedback de Usuários

### Capterra (mais representativo)
- **Nota:** 4.6/5 (142 avaliações verificadas)
- **Sentimento positivo:** 94% | Neutro: 3% | Negativo: 3%
- **Usuários:** 96% pequenos negócios | Saúde/Bem-estar: 40%, Esportes: 22%, ONGs: 19%

**Notas por funcionalidade (Capterra):**
- Online Booking: 4.7/5
- Appointment Management: 4.7/5
- Mobile Access: 4.5/5
- Confirmations/Reminders: 4.5/5

### G2
- **Nota:** 4.5/5

### FinancesOnline
- **SmartScore:** 8.3/10
- **User Satisfaction:** 100% (amostra pequena)

### App Stores
- App Store: **4.8/5**
- Google Play: **4.5/5**

### Prós mais citados pelos usuários
1. Extremamente fácil de usar e configurar
2. Interface limpa e moderna
3. Interface mobile excelente
4. Suporte ao cliente responsivo e atencioso
5. Excelente custo-benefício para pequenos negócios
6. Calendário intuitivo e claro
7. Notificações SMS eficazes para reduzir no-shows

### Contras mais citados pelos usuários
1. Customização limitada (templates, cores, layouts)
2. SMS não incluso no plano — custo adicional
3. Branding Reservio visível em planos inferiores
4. Não é possível alterar nome de cliente após criação da conta
5. Dificuldade em fechar horários específicos
6. Não é possível personalizar texto do SMS de confirmação (planos Free/Starter)
7. Relatórios e analytics menos robustos que concorrentes
8. Reclamações de cobrança (algumas reviews negativas no G2)
9. Ausência de geração de faturas formais (NF)

---

## Pontos Fortes

1. **Plano gratuito genuíno** — 40 reservas/mês sem cartão de crédito, sem trial limitado
2. **Onboarding rápido** — configuração em minutos, interface intuitiva
3. **Suite completa integrada** — calendário + POS + pagamentos + CRM + loyalty em uma plataforma
4. **Multi-idioma** — 25+ idiomas suportados, forte para mercados não-anglófonos
5. **Mercados verticais** — adaptado para saúde, beleza, fitness, educação, serviços profissionais
6. **Apps mobile nativos** (React Native) para negócios e clientes
7. **Branded App** — diferencial para fidelização sem custo de desenvolvimento
8. **Enterprise sólido** — clientes como L'Oréal, IKEA, Kiehl's provam escala
9. **Segurança robusta** — GDPR, LGPD, PCI DSS, ISO 27001, criptografia 256-bit
10. **Multi-localização** — gestão centralizada de redes
11. **COVID-19 pivot** — mostrou resiliência e capacidade de atender saúde pública
12. **ABUGO Holding** — estrutura corporativa sólida com parceiros estratégicos (Smartsupp para chat, Shopsys para e-commerce)

---

## Pontos Fracos / Gaps

### Funcionais
1. **API apenas no plano mais caro** — barreia integrações para pequenos negócios
2. **SMS como add-on pago** — concorrentes incluem SMS nos planos
3. **Branding Reservio** em planos Free, Starter e Standard — client-facing
4. **Sem geração de NF/invoice formais** — gap para mercado brasileiro
5. **Customização da Booking Website limitada** em planos inferiores
6. **Sem lista de espera automática** em aulas cheias (não confirmado)
7. **Zoom integration** ainda "Coming Soon" (gap em video-first)
8. **Terminal físico de cartão** previsto apenas para 2026
9. **Relatórios limitados** comparado a concorrentes enterprise
10. **Sem módulo financeiro completo** (fluxo de caixa, DRE, conciliação)
11. **Marketplace limitado geograficamente** (principalmente Europa Central)

### Técnicos/Negócio
1. **PHP/Nette** — stack relativamente nicho, pode dificultar contratação vs. Node.js/Python
2. **Empresa pequena** — 23 funcionários para 500K negócios (alta alavancagem, mas suporte pode ser limitado)
3. **Documentação de API pobre** — apenas via Apiary, sem SDKs, sem webhooks documentados
4. **Dependência do Adyen** — sem alternativas de gateway, limita cobertura geográfica
5. **Sem app desktop nativo** — apenas web app

### Mercado
1. **Market share pequeno** — Calendly domina com 32,55% vs Reservio com participação menor
2. **Forte em Europa, fraco na América Latina** — pagamentos online não claros para BR
3. **Sem integração nativa com WhatsApp** — gap crítico para mercado brasileiro

---

## O Que Replicar para um Sistema Similar

### Modelo de Acesso e Monetização
- **Plano gratuito real** com limite generoso (40 reservas/mês) — reduz barreira de entrada e permite crescimento orgânico
- **Estrutura de 4 planos** (Free → Starter → Standard → Pro) com upgrades naturais por volume e funcionalidade
- **SMS como add-on** — não incluir no plano base reduz custo operacional
- **Taxa sobre pagamentos** decrescente por plano — incentiva upgrade

### Fluxo de Agendamento
- **Dois tipos de calendário** desde a configuração inicial: individual vs. grupo — simplifica onboarding
- **Booking Website independente** (cada negócio tem URL própria) — elimina necessidade de site externo
- **Widget/iFrame + botão** para embed em qualquer site — integração fácil sem API
- **QR code automático** para materiais físicos — canais offline para online

### Fidelização e Retenção de Clientes
- **3 tipos de passes** (crédito, visitas, tempo) cobrem os principais modelos de fidelidade
- **App branded** (white-label) para negócios que querem exclusividade — upsell premium
- **7 tipos de mensagens automáticas** para clientes — engajamento no ciclo completo
- **Solicitação automática de feedback** pós-visita — geração de reviews

### Gestão de Equipe
- **3 roles** (Admin, Manager, Staff) com permissões granulares — essencial para crescimento do negócio
- **Calendário individual por profissional** com horários próprios
- **Notificações automáticas para staff** (novo agendamento, cancelamento)
- **Rastreador de férias/ausências** integrado ao calendário de disponibilidade

### Integrações Prioritárias (em ordem de impacto)
1. Google Calendar (bidirecional) — expectativa básica do mercado
2. Meta Pixel + Google Analytics — essencial para negócios com marketing digital
3. Facebook/Instagram booking — canal de captação forte
4. Mailchimp/email marketing — nutrição de leads
5. Zapier — conecta o resto do ecossistema sem desenvolver integrações individuais
6. WhatsApp Business API — **gap do Reservio, oportunidade para diferenciação no Brasil**

### POS e Pagamentos
- **POS integrado ao agendamento** — diferencial real: checkout unificado serviço + produto
- **Gestão de inventário em tempo real** — necessidade real de salões, spas, clínicas
- **Múltiplos gateways** — não depender de um único (Adyen é europeu; no Brasil: Pagar.me, Stripe, Mercado Pago)
- **Depósito/entrada no agendamento** — redução de no-shows sem exigir pagamento total

### Tecnologia
- **React Native** para mobile — código compartilhado iOS e Android, manutenção simplificada
- **Two apps** — um para negócios, um para clientes finais
- **Sincronização em tempo real** — disponibilidade sempre atualizada
- **BFF pattern** — separação limpa entre frontend e microserviços de backend
- **ELK Stack** para logs e monitoramento desde cedo

### Conformidade (fundamental para Brasil)
- **LGPD compliance** — campo obrigatório para qualquer SaaS no Brasil
- **Consentimento explícito** no formulário de reserva
- **Direito ao esquecimento** — exclusão de dados a pedido do cliente
- **Criptografia 256-bit** e certificação SSL A+

### Diferenciações para o Mercado Brasileiro (gaps do Reservio)
1. **Integração com WhatsApp Business** — envio de confirmações e lembretes via WhatsApp
2. **Gateways brasileiros** — Mercado Pago, Pagar.me, PicPay, Pix
3. **Emissão de NF-e/NFS-e** — compliance fiscal brasileiro
4. **Integração com eDentista, NFS-e saúde** para verticais de saúde
5. **Precificação em BRL** sem oscilação cambial
6. **Suporte em português** com horário comercial brasileiro
7. **Integração com Google Meu Negócio** para captação local

---

## Concorrentes Diretos

| Concorrente | Diferencial | Preço inicial |
|------------|-------------|---------------|
| Calendly | Melhor para reuniões B2B, 500+ integrações Zapier | $8/mês |
| Acuity Scheduling | Interface mais completa, gorjetas, gift cards | $14/mês |
| SimplyBook.me | Mais templates, chatbot de IA | $9/mês |
| Square Appointments | Integração com POS Square físico | Gratuito |
| Bookeo | Focado em tours/atividades | $14,95/mês |
| Goldie | IA para marketing, foco em beleza | $30/mês |
| TattooGenda | Específico para tatuadores | $16/mês |
| Mindbody | Fitness/wellness avançado | $129/mês |
| Fresha | Gratuito + % sobre pagamentos | Gratuito |

---

*Documento gerado com base em pesquisa pública de fontes abertas em junho de 2026. Informações sujeitas a mudança conforme evolução do produto.*
