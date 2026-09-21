# Soft RH - Sistema de Gestão de Recursos Humanos

Um sistema completo e responsivo de gestão de recursos humanos, desenvolvido com base nos princípios de psicologia das cores para transmitir confiança, profissionalismo e inovação no universo da gestão de pessoas. O sistema utiliza a paleta de cores roxo, preto e branco conforme especificado no PDF sobre psicologia das cores para branding de RH.

## 🎨 Baseado na Psicologia das Cores

Este sistema foi desenvolvido considerando os princípios do PDF sobre psicologia das cores para branding de RH, utilizando:

- **Roxo (#6a1b9a)**: Confiança e profissionalismo
- **Preto (#000000)**: Autoridade e elegância
- **Branco (#ffffff)**: Clareza e transparência
- **Paleta de roxos**: Inovação e criatividade

## ✨ Funcionalidades Implementadas

### 1. Dashboard Interativo
- Estatísticas em tempo real
- Gráficos de distribuição por departamento
- Evolução de contratações
- Alertas e notificações importantes

### 2. Gestão de Funcionários
- CRUD completo de funcionários
- Filtros por departamento e status
- Busca global integrada
- Exportação de dados em CSV
- Status de funcionários (Ativo, De Férias, Afastado)

### 3. Recrutamento e Seletivos
- Gerenciamento de vagas
- Controle de candidatos por vaga
- Status das vagas (Aberta, Fechada, Pausada, Preenchida)
- Sistema de candidatos com status de avaliação

### 4. Treinamento e Desenvolvimento
- Gerenciamento de programas de capacitação
- Controle de participantes
- Agendamento de treinamentos

### 5. Avaliação de Desempenho
- Sistema de avaliações por funcionário
- Notas e observações
- Histórico de avaliações

### 6. Relatórios e Analytics
- Relatórios personalizados
- Exportação de dados
- Analytics integrado

### 7. Configurações
- Personalização da empresa
- Backup e exportação de dados
- Configurações gerais do sistema

## 🚀 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com variáveis CSS
- **JavaScript ES6+**: Programação orientada a objetos
- **Chart.js**: Gráficos interativos
- **localStorage**: Persistência de dados
- **Font Awesome**: Ícones profissionais
- **Google Fonts**: Tipografia Inter

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se perfeitamente a:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (até 767px)
- Mobile pequeno (até 480px)

## 💾 Armazenamento de Dados

O sistema utiliza localStorage para persistência de dados com a seguinte estrutura:

```json
{
  "funcionarios": [...],
  "vagas": [...],
  "treinamentos": [...],
  "avaliacoes": [...],
  "configuracoes": {...},
  "metadata": {...}
}
```

## 🔧 Instalação e Uso

1. **Clone ou baixe os arquivos do projeto**
2. **Abra o arquivo `index.html` em seu navegador**
3. **O sistema criará automaticamente os dados iniciais**

### Estrutura de Arquivos

```
├── index.html              # Página principal
├── css/
│   ├── style.css          # Estilos principais
│   └── responsive.css     # Estilos responsivos
├── js/
│   ├── app.js             # Aplicação principal
│   ├── storage.js         # Gerenciamento de dados
│   ├── funcionarios.js    # CRUD de funcionários
│   ├── recrutamento.js    # CRUD de vagas
│   └── dashboard.js       # Dashboard e gráficos
└── README.md              # Documentação
```

## 🎯 Funcionalidades Principais por Módulo

### Dashboard
- Visualização de KPIs principais
- Gráficos de pizza e linha
- Alertas automáticos
- Atualização em tempo real

### Funcionários
- Cadastro com validação de dados
- Filtros dinâmicos
- Busca instantânea
- Exportação CSV
- Status personalizados

### Recrutamento
- Gestão completa de vagas
- Controle de candidatos
- Status de processo seletivo
- Estatísticas de conversão

## 📊 Dados de Exemplo

O sistema vem com dados de exemplo para demonstração:
- Funcionários em diferentes departamentos
- Vagas abertas e preenchidas
- Avaliações de desempenho
- Treinamentos agendados

## 🔐 Segurança

- Validação de formulários
- Confirmações de ações críticas
- Sanitização de dados
- Armazenamento local seguro

## 🌐 Compatibilidade

- **Navegadores Modernos**: Chrome, Firefox, Safari, Edge
- **Versão mínima**: ES6+
- **Requisitos**: JavaScript habilitado

## 📈 Performance

- Carregamento rápido com CSS e JS otimizados
- Gráficos renderizados apenas quando visíveis
- Lazy loading de componentes
- Armazenamento eficiente em localStorage

## 🔄 Atualizações Futuras

- [ ] Integração com calendário
- [ ] Notificações por email
- [ ] Importação de dados em massa
- [ ] Relatórios PDF
- [ ] Dashboard personalizável
- [ ] API REST simulada
- [ ] Modo escuro

## 🐛 Problemas Conhecidos

- Em browsers muito antigos pode haver problemas de compatibilidade
- localStorage tem limite de 5-10MB dependendo do navegador
- Gráficos podem não funcionar em browsers sem suporte a Canvas

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a console do navegador (F12)
2. Confirme se o localStorage está habilitado
3. Teste em outro navegador moderno

## 📄 Licença

Este projeto é um sistema de demonstração desenvolvido para fins educacionais.

---

**Soft RH** - Desenvolvido com ❤️ e baseado em princípios de psicologia das cores para criar uma experiência de usuário profissional e confiável.