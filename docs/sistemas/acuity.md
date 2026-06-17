# Acuity Scheduling — Análise Completa

> Pesquisa realizada em: junho de 2026  
> Fontes: site oficial, documentação de API, G2, Capterra, TechCrunch, FinancesOnline, Pabau, Zeeg, Talkspresso, SchedulingKit, Koalendar

---

## Visão Geral

Acuity Scheduling é uma plataforma SaaS de agendamento de compromissos online focada em pequenos negócios de serviços. Permite que clientes façam auto-agendamento, enquanto o negócio gerencia calendários, pagamentos, lembretes e dados de clientes em um único sistema.

- **Slogan atual**: "Book appointments, take payments, and automate the busywork"
- **Proprietária atual**: Squarespace (adquirida em abril de 2019)
- **Clientes ativos**: mais de 250.000 negócios globalmente
- **Websites usando o produto**: ~250.591 (85.548 ativos), segundo BuiltWith/Enlyft
- **Market share (agendamento)**: ~8,3% na categoria Appointment Scheduling & Management
- **Público-alvo predominante**: empresas de 0–9 funcionários (solopreneurs e pequenos negócios)
- **Setores principais**: saúde e bem-estar (18%), estética/cosméticos (13%), fitness, consultoria, educação, pet care, automotivo

---

## História e Empresa

| Campo | Detalhe |
|---|---|
| Fundação | 2006 |
| Fundador / CEO original | Gavin Zuchlinski |
| País de origem | Estados Unidos |
| Localização original | Operação remota / EUA |
| Tamanho da equipe na aquisição | 45 funcionários |
| Aquisição | Squarespace — abril de 2019 |
| Valor da aquisição | Não divulgado publicamente |
| Posição pós-aquisição de Gavin | VP de Acuity dentro da Squarespace |
| Operação pós-aquisição | Produto mantido como produto autônomo dentro do ecossistema Squarespace |

### Contexto da Aquisição (2019)
- Primeira aquisição da história da Squarespace
- CEO da Squarespace, Anthony Casalena, citou que "construir internamente seria mais lento" e que Acuity "já era um grande negócio"
- Já havia integração prévia entre Acuity e Squarespace antes da aquisição
- A aquisição coincidiu com o lançamento oficial do produto de email marketing da Squarespace
- Os 45 funcionários do Acuity foram integrados à Squarespace

---

## Modelo de Negócio

- **Modelo**: SaaS com assinatura mensal ou anual
- **Desconto anual**: 20% em todos os planos
- **Trial**: 7 dias grátis (sem cartão de crédito)
- **Plano gratuito**: Não existe. Eliminado após a aquisição pela Squarespace
- **Receita adicional**: taxas de processamento de pagamento (via Stripe/Square/PayPal: ~2,9% + $0,30 por transação)
- **Estratégia**: substituir tanto a ferramenta de agendamento quanto a de cobranças, gerando maior ticket por cliente

---

## Planos e Preços

> Preços em USD, referência 2025–2026

| Plano | Mensal | Anual (por mês) | Calendários | Destaques |
|---|---|---|---|---|
| **Emerging** (Starter) | $20/mês | $16/mês | 1 | Agendamento básico, pagamentos, formulários de intake, lembretes de email |
| **Growing** (Standard) | $34/mês | $27/mês | Até 6 | SMS, aulas/grupos, pacotes, assinaturas, gift certificates, remove marca Acuity |
| **Powerhouse** (Premium) | $61/mês | $49/mês | Até 36 | HIPAA, múltiplos fusos horários, API personalizada, fluxos avançados, suporte prioritário |
| **Enterprise** | Customizado | Customizado | Ilimitados | Soluções personalizadas para grandes empresas |

### Detalhes por Plano

**Plano Emerging ($16–20/mês)**
- 1 membro da equipe / 1 calendário
- Agendamentos ilimitados
- Página de reserva personalizável
- Lembretes de compromissos por email
- Integração com Stripe, Square (pagamentos)
- Integração com Zoom
- Formulários de intake
- Sincronização com Google Calendar
- Aplicativo móvel incluído

**Plano Growing ($27–34/mês)**
- Tudo do Emerging +
- Até 6 membros da equipe / 6 calendários
- Lembretes por SMS (envio para clientes)
- Agendamento de classes e grupos
- Pacotes de sessões
- Assinaturas recorrentes
- Gift certificates (certificados-presente)
- Remove marca Acuity da página de agendamento

**Plano Powerhouse ($49–61/mês)**
- Tudo do Growing +
- Até 36 membros da equipe / 36 calendários
- Múltiplos fusos horários por staff/localização
- Acesso à API personalizada
- Conformidade HIPAA (requer assinar BAA separadamente)
- Fluxos de trabalho avançados
- Suporte prioritário

### Custos Adicionais (não incluídos)
- Zoom Pro: ~$13–17/mês (conta separada necessária para videoconferências)
- Taxas de processamento de pagamento: 2,9% + $0,30 por transação
- Ferramentas de AI para anotações de sessão (ex.: Otter.ai): ~$17–18/mês
- **Custo real estimado**: $33 a $107+/mês quando combinado com ferramentas complementares necessárias

---

## Funcionalidades Completas

### Agendamento Online

- **Auto-agendamento 24/7**: clientes reservam horários disponíveis sem interação humana
- **Página de agendamento dedicada**: URL personalizada e com a marca do negócio
- **Embed no site**: incorporação via iframe ou widget JavaScript em sites existentes
- **Link de agendamento**: link marcado e compartilhável para envio direto a clientes
- **Integração com construtores de site**: Squarespace nativo; compatível com outros construtores via embed
- **Zonas horárias automáticas**: detecção e exibição do fuso horário correto para o cliente
- **Múltiplas zonas horárias** (Powerhouse): diferentes fusos por staff ou localização
- **Reagendamento e cancelamento pelo cliente**: clientes podem gerenciar seus próprios compromissos
- **Política de cancelamento**: prazo mínimo configurável; cobrança automática por cancelamento tardio
- **Depósitos**: coleta de depósito parcial no momento do agendamento
- **Look Busy** ("parecer ocupado"): oculta seletivamente horários disponíveis para simular alta demanda

### Tipos de Agendamento

- **Consultas individuais (1:1)**: formato padrão, sessão com 1 prestador e 1 cliente
- **Aulas em grupo**: múltiplos clientes no mesmo horário (Plano Growing+)
- **Workshops e eventos**: sessões de maior duração com múltiplos participantes
- **Sessões recorrentes**: agendamento de compromissos repetidos (semanal, quinzenal, etc.)
- **Horários bloqueados**: bloqueio de disponibilidade manual pelo admin
- **Consultas virtuais**: via links de Zoom/Google Meet/GoToMeeting integrados
- **Consultas presenciais**: com localização física definida
- **Sequências de compromissos**: agendamentos conectados em série (não confirmado — inferido)

### Calendário e Disponibilidade

- **Gerenciamento multi-calendário**: um calendário por staff ou localização
- **Sincronização bidirecional**: Google Calendar, iCloud, Microsoft Outlook
- **Sincronização com Office 365/Outlook.com/Exchange**: disponível (exceto em contas HIPAA)
- **Drag-and-drop**: reagendamento visual por arrastar e soltar no calendário
- **Código de cores**: compromissos coloridos por tipo de serviço ou status
- **Controles de disponibilidade avançados**:
  - Horas únicas por tipo de serviço
  - Limites máximos de compromissos por dia
  - Intervalos entre compromissos (buffer time)
  - Redução de lacunas (gap optimization) para agrupar compromissos
  - Controle de intervalos de início (ex.: a cada 30 min, 1h)
- **Multi-location**: gerenciamento de múltiplas localizações físicas
- **Staff scheduling**: diferentes horários e disponibilidade por membro da equipe
- **Notificações instantâneas**: alertas ao admin sobre novos agendamentos, reagendamentos e cancelamentos
- **Visualização de relatórios no calendário**: faltas, performance por período

### Formulários e Intake

- **Formulários de intake customizáveis**: campos personalizados para coletar informações pré-sessão
- **Tipos de campo**: texto, múltipla escolha, checkboxes, data, arquivo (não confirmado — inferido a partir de plataformas similares)
- **Formulários por tipo de serviço**: formulários diferentes para cada tipo de consulta
- **Dados coletáveis**: histórico médico, medicamentos, alergias, sintomas (uso clínico/saúde)
- **Termos e políticas**: clientes aceitam termos e políticas de cancelamento durante agendamento
- **Perfis de cliente**: formulários associados ao perfil; histórico de respostas armazenado
- **HIPAA**: em contas com HIPAA ativo, respostas de formulários NÃO são incluídas em notificações de email (proteção extra)

### Módulo Financeiro

**Pagamentos**
- Integração com **Stripe**, **Square** e **PayPal**
- Pré-pagamento total no momento do agendamento
- Depósito parcial configurável
- Armazenamento seguro de cartão (para cobrança posterior)
- Aplicação de políticas de cancelamento com cobrança automática
- Pagamentos presenciais via app mobile (tap-to-pay, leitores de cartão Square)
- **Google Pay** e **Apple Pay** aceitos
- Links de pagamento seguros enviáveis por email/SMS
- Opção de gorjeta (tips)
- Recibos automáticos por email

**Faturamento (Invoicing)**
- Criação e envio de faturas profissionais
- Auto-preenchimento de dados do cliente e serviço
- Mensagens personalizadas e logotipo na fatura
- Dashboard de gestão de faturas com rastreamento de status
- Integração com **QuickBooks** e **FreshBooks** para contabilidade

**Ferramentas Promocionais e Fidelidade**
- **Pacotes de sessões**: venda antecipada de múltiplas sessões com desconto
- **Assinaturas recorrentes**: cobrança mensal/semanal por acesso a serviços
- **Gift certificates (certificados-presente)**: clientes compram e presenteiam
- **Códigos de desconto / cupons**: criação e aplicação de cupons promocionais
- **Add-ons**: complementos vendidos durante o agendamento (ex.: produto extra, serviço adicional)
- **Point of Sale (POS)**: ferramenta para transações presenciais

### CRM de Clientes

- **Perfis de cliente individuais**: armazenamento centralizado de dados por cliente
- **Histórico de agendamentos**: todos os compromissos passados e futuros por cliente
- **Notas por cliente**: campo para observações do prestador, visível apenas internamente
- **Respostas de formulários**: histórico de formulários de intake preenchidos
- **Histórico financeiro**: pacotes adquiridos, assinaturas, uso de gift certificates
- **Importação de contatos**: importação automática de contatos do telefone no app mobile
- **Restrição de clientes**: bloqueio de clientes específicos de fazerem novos agendamentos
- **Contas de cliente**: clientes podem criar login para agendamento mais rápido em visitas futuras
- **Segmentação via email marketing**: integração com Mailchimp/ActiveCampaign para segmentar por comportamento de agendamento

### Notificações e Comunicação

**Para Clientes:**
- Confirmação de agendamento por email (automática)
- Lembretes de email antes do compromisso (configuráveis em frequência e antecedência)
- Lembretes por SMS (Plano Growing+)
- Notificações de reagendamento e cancelamento
- Instruções customizadas por tipo de serviço (ex.: "traga documentos", "chegue 5 min antes")
- Links de videoconferência automaticamente incluídos para sessões virtuais
- Follow-up após sessão (não confirmado — inferido de plataformas similares)

**Para o Admin/Staff:**
- Notificações push (app mobile) para novos agendamentos, reagendamentos e cancelamentos
- Notificações por email para a equipe
- Alertas instantâneos configuráveis por tipo de evento

**Customização de comunicações:**
- Templates de email personalizáveis com marca do negócio
- Mensagens customizadas por tipo de serviço

### Relatórios e Analytics

- **Relatórios de agendamentos**: volume por período, por tipo de serviço, por staff
- **Rastreamento de no-shows (faltas)**: registro e relatório de ausências
- **Performance de receita**: relatórios de pagamentos, receita por período
- **Relatórios de pacotes e assinaturas**: uso e expiração
- **Relatórios de gift certificates**: emissão e resgate
- **Integração com Google Analytics**: rastreamento de conversões da página de agendamento
- **Rastreamento de conversão customizado**: pixel de conversão configurável
- **Exportação de dados**: (não confirmado — inferido)
- **Nota**: relatórios considerados básicos por usuários avançados — ponto de crítica frequente

### Multi-location e Multi-staff

- **Múltiplas localizações**: calendários separados por local físico
- **Múltiplos membros de equipe**: calendários individuais por funcionário
- **Permissões de staff**: controle granular de acesso — o que cada membro pode ver/editar
- **Acesso a dados de cliente por staff**: configurável pelo admin
- **Fusos horários por staff/local** (Powerhouse): cada membro pode ter seu fuso
- **Limite de staff por plano**:
  - Emerging: 1
  - Growing: até 6
  - Powerhouse: até 36
  - Enterprise: ilimitado

### Customização e White-label

- **Página de agendamento personalizada**: logo, cores, imagens de fundo, texto da marca
- **Remoção da marca Acuity** (Growing+): link e interface sem referência ao Acuity
- **CSS customizado**: estilos personalizados via código CSS (disponível para usuários técnicos)
- **Templates de email com marca**: emails enviados com identidade visual do negócio
- **Domain/URL personalizada**: URL amigável com o nome do negócio
- **Construtor de website**: integração nativa com Squarespace para criar site completo com agendamento

---

## App Mobile

- **Plataformas**: iOS (iPhone e iPad) e Android
- **Disponibilidade**: incluído em TODOS os planos, inclusive durante o trial
- **Distribuição**: App Store e Google Play Store

### Funcionalidades do App Mobile

1. **Visualização de calendário**: ver todos os compromissos do dia; navegar para qualquer data
2. **Ajuste de disponibilidade**: modificar horários disponíveis em tempo real pelo celular
3. **Gerenciamento de serviços**: criar, editar e gerenciar tipos de consulta, classes, add-ons e cupons
4. **Operações de agendamento**: criar novos agendamentos; reagendar via drag-and-drop; cancelar
5. **Notificações push**: alertas customizáveis para novos agendamentos, reagendamentos e cancelamentos
6. **Banco de clientes**: acesso a informações de contato, histórico, notas e restrições
7. **Links de agendamento**: enviar links específicos por serviço, staff ou localização
8. **Faturamento**: gerar e enviar faturas profissionais pelo celular
9. **Processamento de pagamentos**: aceitar pagamentos presenciais (tap-to-pay, leitor Square); links de pagamento; Google Pay e Apple Pay
10. **Suporte in-app**: ferramenta de feedback para reportar problemas

**Limitações do App:**
- Funcional mas menos completo que o dashboard web
- Relatórios e configurações avançadas disponíveis apenas na versão web

---

## Integrações

### Calendários
- Google Calendar (sincronização bidirecional)
- Apple iCloud Calendar
- Microsoft Outlook / Office 365 / Exchange (exceto em contas HIPAA)

### Pagamentos
- Stripe
- Square (incluindo hardware de leitores físicos)
- PayPal

### Videoconferência
- Zoom
- Google Hangouts Meet / Google Meet
- GoToMeeting
- JoinMe

### Email Marketing
- Mailchimp
- ActiveCampaign
- Squarespace Email Campaigns
- ConvertKit
- Drip
- AWeber
- Constant Contact
- Simplero

### Contabilidade e Faturamento
- QuickBooks
- FreshBooks

### CRM (direto e via Zapier)
- Zoho CRM (nativo)
- Salesforce (via Zapier)
- Infusionsoft / Keap (via Zapier)
- Pipedrive (direto)
- Daylite (via terceiros)

### Formulários Externos
- Wufoo

### Marketplace e Plataformas Especiais
- ClassPass (via terceiros)
- Instagram (agendamento via bio link)
- Facebook (botão de agendamento)

### Analytics e Rastreamento
- Google Analytics
- Rastreamento de conversão customizado (pixel)

### Automação e Conectores
- Zapier (conecta a 500+ aplicativos)
  - Google Contacts
  - Google Sheets
  - Salesforce
  - Infusionsoft / Keap
  - E centenas de outros

### Fidelização
- ReferralCandy
- ReviewRail

### Engajamento de Clientes
- Zoho Flow

### Plataforma de Website
- Squarespace (integração nativa profunda)
- Qualquer site via embed JavaScript/iframe

### API e Webhooks (ver seção específica)
- API REST própria
- Webhooks dinâmicos

---

## API e Webhooks

### API REST

- **Endpoint base**: `https://acuityscheduling.com/api/v1/`
- **Versões disponíveis**: v1.0 e v1.1
- **Autenticação**: HTTP Basic Auth (User ID + API Key)
- **OAuth2**: disponível para aplicações de terceiros
- **Documentação oficial**: https://developers.acuityscheduling.com/
- **Especificação OpenAPI**: disponível em https://developers.acuityscheduling.com/llms.txt
- **Acesso à API**: disponível apenas no plano Powerhouse ($49–61/mês)

**Operações da API:**
- Criar agendamentos (`POST /appointments`)
- Consultar disponibilidade (Browse Availability)
- Bloquear horários (Block Off Time)
- Gerenciar clientes
- Gerenciar tipos de serviços
- Acessar formulários de intake
- Consultar e gerar relatórios

### SDKs Oficiais

- **JavaScript/Node.js**: https://github.com/AcuityScheduling/acuity-js
- **PHP**: https://github.com/AcuityScheduling/acuity-php
- **PHP OAuth2 Sample App**: https://github.com/AcuityScheduling/acuity-php-sample-app
- Kits com interface unificada, verificação de webhooks e conexão OAuth2

### Webhooks

- **Suporte**: webhooks dinâmicos para notificar sistemas externos
- **Eventos suportados**:
  - Agendamento criado
  - Agendamento cancelado
  - Agendamento reagendado
  - Dados de agendamento atualizados (email, formulários, etc.)
- **Limite**: máximo de 25 webhooks por conta
- **Portas aceitas**: 443 (HTTPS) ou 80 (HTTP)
- **Estrutura**: cada subscription = evento + URL destino

### Embed e Integração Frontend

- **Embed via iframe**: incorporação da página de agendamento em qualquer site
- **Widget JavaScript**: integração mais fluida com customização via CSS
- **Links dinâmicos**: parâmetros de URL para pré-selecionar serviço, staff ou horário
- **Sidebar customizável**: painel lateral customizável via API

---

## Stack Técnica

> Nota: a Squarespace não publica a stack interna oficialmente. As informações abaixo são inferidas de vagas de emprego publicadas no BuiltIn NYC, GitHub oficial, e ferramentas de detecção de tecnologia.

### Backend

| Tecnologia | Evidência / Confiança |
|---|---|
| **PHP** | Confirmado — vaga "Software Engineer, PHP (Acuity)" publicada no BuiltIn NYC; SDK oficial em PHP no GitHub |
| **Go (Golang)** | Provável — mencionado em vagas de engenharia de backend da Squarespace para o time Acuity |
| **Node.js / JavaScript** | Confirmado para SDK oficial; provável no backend para serviços específicos |

### Frontend

| Tecnologia | Evidência / Confiança |
|---|---|
| **React** | Provável — mencionado em análises de tech stack; Squarespace usa React amplamente |
| **jQuery** | Detectado pelo G2 Stack (tecnologia legada, possível manutenção de features antigas) |
| **HTML5** | Detectado pelo G2 Stack |
| **Google Font API** | Detectado pelo BuiltWith |

### Banco de Dados

| Tecnologia | Evidência / Confiança |
|---|---|
| Relacional (MySQL ou PostgreSQL) | Inferido — padrão para aplicações PHP/Go de escala média (não confirmado) |

### Infraestrutura e Cloud

| Tecnologia | Evidência / Confiança |
|---|---|
| AWS ou GCP | Inferido — padrão Squarespace (não confirmado publicamente) |

### Analytics e Monitoramento (detectados externamente)

- Google Analytics (integração oferecida e usada internamente)
- Ferramentas de rastreamento: detectadas via BuiltWith em ~32 tecnologias ativas no site

### Mobile

- **iOS**: app nativo (Swift ou Objective-C — não confirmado)
- **Android**: app nativo (Kotlin ou Java — não confirmado)
- Ambos disponíveis nas respectivas stores

### Segurança e Compliance

- **HIPAA**: disponível no plano Powerhouse mediante assinatura de BAA (Business Associate Agreement)
  - Restrições HIPAA: desativa sincronização com Office 365/Outlook.com/iCloud; respostas de formulários não incluídas em emails
- **TLS/HTTPS**: obrigatório para webhooks (porta 443)
- **PCI DSS**: processamento via Stripe/Square/PayPal (compliance delegado aos processadores)
- **OAuth2**: para aplicações de terceiros via API

---

## Avaliações e Feedback

### Ratings Gerais

| Plataforma | Rating | Nº de Reviews |
|---|---|---|
| G2 | 4.7 / 5 | 406+ |
| Capterra | 4.8 / 5 | 600+ |
| GetApp | 4.8 / 5 | 600+ |
| Software Advice | 4.8 / 5 | 600+ |

### Reconhecimentos

- Capterra Shortlist 2024 para Appointment Scheduling
- Altamente avaliado em múltiplas categorias de saúde e bem-estar

### Perfil de Usuário

- 95% são pequenos negócios
- Setores principais: Saúde & Bem-estar (18%), Cosméticos/Estética (13%)
- Predominância: solopreneurs e times pequenos no mercado americano (73,8% dos usuários são dos EUA)

### Elogios Recorrentes (voz do usuário)

- Interface intuitiva e fácil de configurar
- Sincronização confiável com Google Calendar
- Integração de pagamentos sólida (Stripe/Square/PayPal)
- Lembretes automáticos reduzem faltas significativamente
- "Cortou 80% do tempo gasto com tarefas administrativas" (consultores e coaches)
- Bom custo-benefício para negócios com volume constante de agendamentos
- Confiabilidade do sistema (poucos relatos de instabilidade)

### Críticas Recorrentes (voz do usuário)

- Sem plano gratuito (eliminou o freemium após aquisição pela Squarespace)
- SMS apenas nos planos superiores
- Suporte apenas por email — sem atendimento telefônico, respostas lentas
- Interface datada em algumas áreas do painel admin
- Relatórios limitados para usuários avançados
- Necessidade de re-login frequente desde a integração com Squarespace
- Configurações avançadas podem ser "não intuitivas"
- Sem funcionalidades clínicas nativas (notas de tratamento, prescrições, faturamento médico)
- Custo real aumenta com add-ons necessários (Zoom Pro, ferramentas de AI, etc.)
- Add-ons de eventos pouco customizáveis

---

## Pontos Fortes

1. **Maturidade e confiabilidade**: 18+ anos no mercado, produto estável e testado em escala
2. **Experiência de agendamento para o cliente**: UX do processo de booking bem refinada
3. **Módulo financeiro completo**: pagamentos, faturas, pacotes, assinaturas, gift cards — tudo integrado
4. **Flexibilidade de configuração de disponibilidade**: múltiplos controles granulares de quando e como o profissional está disponível
5. **Integrações nativas robustas**: calendários, pagamentos, videoconferência, email marketing e contabilidade sem precisar de Zapier
6. **App mobile funcional**: gestão completa de agenda e pagamentos pelo celular
7. **HIPAA compliance**: diferencial para saúde e bem-estar (plano Powerhouse)
8. **API + webhooks**: possibilidade de integração profunda para desenvolvedores
9. **Multi-staff e multi-location**: suporte real para equipes e franquias em escala
10. **Formulários de intake poderosos**: coleta de informações pré-sessão sem ferramentas externas
11. **Ecossistema Squarespace**: integração nativa com o construtor de sites mais popular entre pequenos negócios criativos

---

## Pontos Fracos / Gaps

1. **Sem plano gratuito**: competidores como Calendly e Cal.com oferecem versões free
2. **SMS restrito**: disponível somente a partir do plano Growing ($34/mês)
3. **API restrita ao Powerhouse**: acesso à API apenas no plano mais caro ($61/mês), bloqueando integrações de desenvolvedores em planos menores
4. **Suporte limitado**: apenas email, sem chat em tempo real ou telefone
5. **Relatórios básicos**: sem relatórios de funil, cohort, LTV de cliente ou exportações avançadas
6. **Sem vídeo/gravação nativo**: depende de Zoom/Meet com conta separada paga
7. **Sem notas de sessão/tratamento nativas**: para saúde, falta documentação clínica integrada
8. **Sem agendamento recorrente avançado**: limitações em séries de agendamentos complexos (não confirmado totalmente)
9. **Interface legada em partes**: frontend mostra sinais de dívida técnica
10. **Customização de email limitada**: usuários reportam dificuldade para customizar templates de email
11. **Notificações duplicadas**: bug reportado por usuários em certas configurações
12. **Sem integrações com plataformas de EAD** (Teachable, Thinkific) de forma nativa
13. **Roadmap pouco comunicado**: desde a aquisição, menor velocidade de lançamento de funcionalidades
14. **Custo real elevado**: entre assinatura + ferramentas complementares, pode chegar a $107+/mês para uma operação completa

---

## O que Replicar para um Sistema Similar

### Funcionalidades de Alta Prioridade (core obrigatório)

1. **Auto-agendamento do cliente** com página personalizável e embed em sites
2. **Sincronização bidirecional com Google Calendar e iCloud** para evitar conflitos
3. **Formulários de intake customizáveis** por tipo de serviço, salvos no perfil do cliente
4. **Módulo de pagamentos integrado** (Stripe obrigatório; Square e PayPal como opcionais)
5. **Lembretes automáticos** de email e SMS antes do compromisso
6. **CRM básico de clientes** com histórico de agendamentos, notas e formulários
7. **Multi-staff**: calendários individuais com controles de permissão
8. **Política de cancelamento** com cobrança automática por cancelamento tardio

### Funcionalidades de Médio Prazo (diferenciadores)

9. **Pacotes de sessões e assinaturas recorrentes** — geração de receita previsível
10. **Gift certificates** — canais de aquisição de novos clientes
11. **Código de desconto / cupons** — ferramenta de promoção
12. **Add-ons durante o agendamento** — upsell automático
13. **Aulas/grupos**: múltiplos clientes no mesmo horário
14. **App mobile** para o admin com gestão de calendario e pagamentos
15. **Relatórios básicos**: volume de agendamentos, no-shows, receita por período

### Oportunidades de Superar o Acuity

16. **Plano gratuito funcional** — Acuity eliminou o seu; é diferencial competitivo claro
17. **SMS incluído desde o plano mais básico** — Acuity restringe ao Growing
18. **API disponível em todos os planos** — Acuity restringe ao Powerhouse
19. **Suporte por chat em tempo real** — ponto de dor explícito dos usuários do Acuity
20. **Relatórios avançados**: LTV de cliente, cohort de retenção, funil de conversão de agendamento
21. **Notas de sessão integradas**: para coaches, terapeutas e profissionais de saúde
22. **Vídeo integrado nativo** (sem depender de Zoom pago)
23. **Interface moderna e responsiva** — Acuity tem dívida técnica de frontend
24. **Automações avançadas** (fluxos de follow-up, sequências de email pós-sessão)
25. **Preços mais acessíveis** para solopreneurs em early stage

### Pontos de Atenção Técnica

- Implementar sincronização bidirecional de calendário é tecnicamente complexo; priorizar Google Calendar inicialmente
- HIPAA compliance adiciona complexidade significativa de arquitetura; deixar para versão enterprise
- Limitar webhooks por conta para controle de carga no sistema (Acuity: máx 25)
- OAuth2 para integrações de terceiros é obrigatório para ecossistema de parceiros
- Processamento de pagamento via gateway (Stripe) reduz responsabilidade PCI DSS

---

## Fontes Consultadas

1. [Acuity Scheduling — Site Oficial](https://acuityscheduling.com/)
2. [Acuity Scheduling — Página de Funcionalidades](https://acuityscheduling.com/features)
3. [Acuity Scheduling — Integrações](https://acuityscheduling.com/integrations)
4. [Acuity Scheduling — Comparação com Calendly](https://acuityscheduling.com/compare/acuity-vs-calendly)
5. [Acuity Scheduling — App Mobile](https://acuityscheduling.com/learn/acuity-scheduling-mobile-app)
6. [Acuity Scheduling — Developer API](https://developers.acuityscheduling.com/)
7. [TechCrunch — Aquisição pela Squarespace (2019)](https://techcrunch.com/2019/04/23/squarespace-acquires-acuity-scheduling)
8. [Squarespace — Press Coverage da Aquisição](https://www.squarespace.com/press-coverage/2019/4/23/squarespace-acquires-acuity-scheduling)
9. [G2 — Reviews Acuity Scheduling](https://www.g2.com/products/acuity-scheduling/reviews)
10. [Capterra — Reviews Acuity Scheduling](https://www.capterra.com/p/191978/Acuity-Scheduling/reviews/)
11. [SchedulingKit — Guia de Preços 2026](https://schedulingkit.com/pricing-guides/acuity-scheduling-pricing)
12. [Talkspresso — Features, Pricing, Pros & Cons 2026](https://talkspresso.com/blog/acuity-scheduling-features-pricing-pros-cons-2026)
13. [Zeeg — Review e Comparativo](https://zeeg.me/en/blog/post/acuity-scheduling)
14. [Pabau — Reviews e HIPAA](https://pabau.com/blog/acuity-scheduling-reviews/)
15. [FinancesOnline — Prós e Contras](https://financesonline.com/pros-and-cons-of-acuity-scheduling/)
16. [Koalendar — Preços 2026](https://koalendar.com/blog/acuity-scheduling-pricing)
17. [Enlyft — Market Share](https://enlyft.com/tech/products/acuity-scheduling)
18. [GitHub AcuityScheduling — acuity-js](https://github.com/AcuityScheduling/acuity-js)
19. [GitHub AcuityScheduling — acuity-php](https://github.com/AcuityScheduling/acuity-php)
20. [Rollout — API Essentials](https://rollout.com/integration-guides/acuity-scheduling/api-essentials)
21. [BuiltIn NYC — Vaga PHP Acuity (Squarespace)](https://www.builtinnyc.com/job/software-engineer-php-acuity/265130)
22. [Mixergy — Origin Story / Aquisição](https://mixergy.com/interviews/acuity-scheduling-was-just-acquired-by-squarespace-and-heres-their-origin-story/)
23. [AccountableHQ — HIPAA Compliance](https://www.accountablehq.com/post/is-acuity-scheduling-hipaa-compliant-baa-and-plan-requirements-explained)
24. [Koalendar — Calendly vs Acuity](https://koalendar.com/scheduling-software-comparison/calendly-vs-acuity-scheduling)
25. [Cal.com Blog — Calendly vs Acuity 2026](https://cal.com/blog/calendly-vs-acuity-a-comparative-guide-to-scheduling-tools)
