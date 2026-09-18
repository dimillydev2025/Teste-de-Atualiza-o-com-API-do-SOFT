/**
 * Soft RH - Sistema de Gestão de Recursos Humanos
 * Arquivo principal de aplicação
 */

class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentAvaliacaoId = null;
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.toastContainer = document.getElementById('toastContainer');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createSampleData();
        this.loadSection('dashboard');
        this.updateDashboard();
        this.showToast('Sistema iniciado com sucesso!', 'success');
    }

    setupEventListeners() {
        // Navegação do sidebar
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.loadSection(section);
            });
        });

        // Toggle do sidebar mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Busca global
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Configurações gerais
        const configForm = document.getElementById('configGeraisForm');
        if (configForm) {
            configForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveConfiguracoes();
            });
        }

        // Backup e exportação
        const backupBtn = document.getElementById('backupBtn');
        const exportarBtn = document.getElementById('exportarBtn');
        const exportDashboardBtn = document.getElementById('exportDashboardBtn');
        
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.fazerBackup());
        }
        
        if (exportarBtn) {
            exportarBtn.addEventListener('click', () => this.exportarDados());
        }
        if (exportDashboardBtn) {
            exportDashboardBtn.addEventListener('click', () => window.dashboardManager?.exportarDashboard());
        }

        document.querySelectorAll('[data-report]').forEach(button => {
            button.addEventListener('click', () => this.gerarRelatorio(button.dataset.report));
        });

        const addTreinamento = document.getElementById('addTreinamento');
        const treinamentoForm = document.getElementById('treinamentoForm');
        const cancelTreinamento = document.getElementById('cancelTreinamento');
        const closeTreinamentoModal = document.getElementById('closeTreinamentoModal');

        if (addTreinamento) {
            addTreinamento.addEventListener('click', () => this.openTreinamentoModal());
        }
        if (treinamentoForm) {
            treinamentoForm.addEventListener('submit', (e) => this.handleTreinamentoSubmit(e));
        }
        if (cancelTreinamento) {
            cancelTreinamento.addEventListener('click', () => this.closeTreinamentoModal());
        }
        if (closeTreinamentoModal) {
            closeTreinamentoModal.addEventListener('click', () => this.closeTreinamentoModal());
        }

        const addAvaliacao = document.getElementById('addAvaliacao');
        const avaliacaoForm = document.getElementById('avaliacaoForm');
        const cancelAvaliacao = document.getElementById('cancelAvaliacao');
        const closeAvaliacaoModal = document.getElementById('closeAvaliacaoModal');
        const avaliacoesContainer = document.getElementById('avaliacoesContainer');

        if (addAvaliacao) addAvaliacao.addEventListener('click', () => this.openAvaliacaoModal());
        if (avaliacaoForm) avaliacaoForm.addEventListener('submit', (e) => this.handleAvaliacaoSubmit(e));
        if (cancelAvaliacao) cancelAvaliacao.addEventListener('click', () => this.closeAvaliacaoModal());
        if (closeAvaliacaoModal) closeAvaliacaoModal.addEventListener('click', () => this.closeAvaliacaoModal());
        if (avaliacoesContainer) {
            avaliacoesContainer.addEventListener('click', (e) => {
                const button = e.target.closest('[data-avaliacao-action]');
                if (!button) return;
                const id = button.dataset.id;
                if (button.dataset.avaliacaoAction === 'edit') this.openAvaliacaoModal(id);
                if (button.dataset.avaliacaoAction === 'delete') this.deleteAvaliacao(id);
            });
        }

        // Fechar modal ao clicar fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    createSampleData() {
        // Verifica se já existem dados no sistema
        const funcionarios = storageManager.getFuncionarios();
        if (funcionarios.length > 0) return;

        // Criar dados de exemplo
        const sampleFuncionarios = [
            {
                nome: 'João Silva',
                email: 'joao.silva@empresa.com',
                telefone: '(11) 98765-4321',
                cargo: 'Desenvolvedor Sênior',
                departamento: 'TI',
                salario: '8500',
                dataAdmissao: '2023-01-15',
                dataNascimento: '1990-03-20',
                status: 'ativo'
            },
            {
                nome: 'Maria Santos',
                email: 'maria.santos@empresa.com',
                telefone: '(11) 99876-5432',
                cargo: 'Gerente de RH',
                departamento: 'RH',
                salario: '7200',
                dataAdmissao: '2022-08-10',
                dataNascimento: '1985-07-12',
                status: 'ativo'
            },
            {
                nome: 'Pedro Oliveira',
                email: 'pedro.oliveira@empresa.com',
                telefone: '(11) 91234-5678',
                cargo: 'Analista de Vendas',
                departamento: 'Vendas',
                salario: '4500',
                dataAdmissao: '2024-02-01',
                dataNascimento: '1992-11-05',
                status: 'ativo'
            }
        ];

        const sampleVagas = [
            {
                titulo: 'Desenvolvedor Full Stack',
                departamento: 'TI',
                descricao: 'Desenvolvimento de aplicações web modernas',
                requisitos: 'Conhecimento em JavaScript, Python, banco de dados',
                salario: '6000-8000',
                tipo: 'CLT',
                localizacao: 'São Paulo - SP',
                status: 'aberta',
                dataCriacao: '2024-01-15',
                candidatos: []
            },
            {
                titulo: 'Analista de Marketing',
                departamento: 'Marketing',
                descricao: 'Gestão de campanhas digitais e branding',
                requisitos: 'Conhecimento em Google Ads, Facebook Ads',
                salario: '4000-5500',
                tipo: 'CLT',
                localizacao: 'São Paulo - SP',
                status: 'aberta',
                dataCriacao: '2024-02-01',
                candidatos: []
            }
        ];

        // Adicionar funcionários
        sampleFuncionarios.forEach(func => {
            storageManager.addFuncionario(func);
        });

        // Adicionar vagas
        sampleVagas.forEach(vaga => {
            storageManager.addVaga(vaga);
        });

        // Adicionar algumas avaliações
        const avaliacoes = [
            {
                funcionarioId: '1',
                funcionarioNome: 'João Silva',
                tipo: 'Avaliação Trimestral',
                nota: 8,
                data: '2024-01-30',
                observacoes: 'Excelente desempenho no desenvolvimento de novas funcionalidades.'
            },
            {
                funcionarioId: '2',
                funcionarioNome: 'Maria Santos',
                tipo: 'Avaliação Trimestral',
                nota: 9,
                data: '2024-01-28',
                observacoes: 'Líder exemplar, demonstrou excelência na gestão da equipe.'
            }
        ];

        avaliacoes.forEach(av => {
            storageManager.addAvaliacao(av);
        });
    }

    loadSection(sectionName) {
        // Esconde todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active de todos os itens do menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Ativa a seção selecionada
        const targetSection = document.getElementById(sectionName);
        const targetMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        if (targetMenuItem) {
            targetMenuItem.classList.add('active');
        }

        // Atualiza o título da página
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                dashboard: 'Dashboard',
                funcionarios: 'Funcionários',
                recrutamento: 'Recrutamento',
                treinamento: 'Treinamento',
                avaliacao: 'Avaliação',
                relatorios: 'Relatórios',
                configuracoes: 'Configurações'
            };
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }

        // Atualiza dados específicos da seção
        this.updateSectionData(sectionName);

        // Fecha o sidebar em mobile após seleção
        if (window.innerWidth <= 767) {
            this.closeSidebar();
        }
    }

    updateSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'funcionarios':
                if (window.funcionariosManager) {
                    window.funcionariosManager.loadFuncionarios();
                }
                break;
            case 'recrutamento':
                if (window.recrutamentoManager) {
                    window.recrutamentoManager.loadVagas();
                }
                break;
            case 'treinamento':
                this.loadTreinamentos();
                break;
            case 'avaliacao':
                this.loadAvaliacoes();
                break;
        }
    }

    updateDashboard() {
        if (window.dashboardManager) {
            window.dashboardManager.updateAll();
            return;
        }

        const stats = storageManager.getEstatisticas();
        
        // Atualiza estatísticas
        const elements = {
            totalFuncionarios: document.getElementById('totalFuncionarios'),
            novosFuncionarios: document.getElementById('novosFuncionarios'),
            taxaSatisfacao: document.getElementById('taxaSatisfacao'),
            custoRH: document.getElementById('custoRH')
        };

        if (elements.totalFuncionarios) {
            elements.totalFuncionarios.textContent = stats.totalFuncionarios;
        }
        if (elements.novosFuncionarios) {
            elements.novosFuncionarios.textContent = stats.novosFuncionarios;
        }
        if (elements.taxaSatisfacao) {
            elements.taxaSatisfacao.textContent = stats.taxaSatisfacao + '%';
        }
        if (elements.custoRH) {
            elements.custoRH.textContent = 'R$ ' + stats.custoRH.toLocaleString('pt-BR');
        }

        // Atualiza gráficos
        this.updateCharts();
    }

    updateCharts() {
        // Gráfico de Departamentos
        const departamentoCtx = document.getElementById('departamentoChart');
        if (departamentoCtx) {
            const funcionarios = storageManager.getFuncionarios();
            const departamentos = {};
            
            funcionarios.forEach(f => {
                departamentos[f.departamento] = (departamentos[f.departamento] || 0) + 1;
            });

            new Chart(departamentoCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(departamentos),
                    datasets: [{
                        data: Object.values(departamentos),
                        backgroundColor: [
                            '#2563eb',
                            '#10b981',
                            '#8b5cf6',
                            '#f59e0b',
                            '#ef4444'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Gráfico de Contratações
        const contratacoesCtx = document.getElementById('contratacoesChart');
        if (contratacoesCtx) {
            const funcionarios = storageManager.getFuncionarios();
            const meses = {};
            
            funcionarios.forEach(f => {
                const mes = new Date(f.dataAdmissao).toLocaleDateString('pt-BR', { 
                    month: 'short', 
                    year: 'numeric' 
                });
                meses[mes] = (meses[mes] || 0) + 1;
            });

            // Ordena por data
            const labels = Object.keys(meses).sort((a, b) => {
                return new Date(a) - new Date(b);
            });

            new Chart(contratacoesCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Contratações',
                        data: labels.map(label => meses[label]),
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    handleGlobalSearch(termo) {
        if (!termo) return;

        const resultados = storageManager.searchFuncionarios(termo);
        
        if (resultados.length > 0) {
            this.showToast(`Encontrados ${resultados.length} funcionários`, 'info');
            
            // Se estiver na página de funcionários, atualiza a tabela
            if (this.currentSection === 'funcionarios' && window.funcionariosManager) {
                window.funcionariosManager.displayFuncionarios(resultados);
            }
        } else {
            this.showToast('Nenhum resultado encontrado', 'warning');
        }
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('active');
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        this.toastContainer.appendChild(toast);

        // Remove o toast após a duração
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    saveConfiguracoes() {
        const configuracoes = {
            nomeEmpresa: document.getElementById('nomeEmpresa')?.value,
            emailContato: document.getElementById('emailContato')?.value
        };

        if (storageManager.updateConfiguracoes(configuracoes)) {
            this.showToast('Configurações salvas com sucesso!', 'success');
        } else {
            this.showToast('Erro ao salvar configurações', 'error');
        }
    }

    fazerBackup() {
        const dados = storageManager.exportarDados();
        if (dados) {
            const blob = new Blob([dados], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-soft-rh-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('Backup realizado com sucesso!', 'success');
        } else {
            this.showToast('Erro ao criar backup', 'error');
        }
    }

    exportarDados() {
        // Similar ao backup, mas com formatação diferente
        this.fazerBackup();
    }

    gerarRelatorio(tipo) {
        const relatorios = {
            funcionarios: {
                nome: 'funcionarios',
                cabecalho: ['Nome', 'Email', 'Cargo', 'Departamento', 'Data de Admissão', 'Salário', 'Status'],
                linhas: storageManager.getFuncionarios().map(funcionario => [
                    funcionario.nome,
                    funcionario.email,
                    funcionario.cargo,
                    funcionario.departamento,
                    funcionario.dataAdmissao,
                    funcionario.salario || 0,
                    funcionario.status
                ])
            },
            desempenho: {
                nome: 'desempenho',
                cabecalho: ['Funcionário', 'Tipo de Avaliação', 'Nota', 'Data', 'Observações'],
                linhas: storageManager.getAvaliacoes().map(avaliacao => [
                    avaliacao.funcionarioNome,
                    avaliacao.tipo,
                    avaliacao.nota,
                    avaliacao.data,
                    avaliacao.observacoes
                ])
            },
            recrutamento: {
                nome: 'recrutamento',
                cabecalho: ['Vaga', 'Departamento', 'Status', 'Candidatos', 'Descrição'],
                linhas: storageManager.getVagas().map(vaga => [
                    vaga.titulo,
                    vaga.departamento,
                    vaga.status,
                    vaga.candidatos?.length || 0,
                    vaga.descricao
                ])
            }
        };

        const relatorio = relatorios[tipo];
        if (!relatorio) return;

        const csv = [relatorio.cabecalho, ...relatorio.linhas]
            .map(linha => linha.map(valor => `"${String(valor ?? '').replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-${relatorio.nome}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('Relatório gerado com sucesso!', 'success');
    }

    loadTreinamentos() {
        const treinamentos = storageManager.getTreinamentos();
        const container = document.getElementById('treinamentosContainer');
        
        if (container) {
            container.innerHTML = treinamentos.length ? treinamentos.map(treinamento => `
                <div class="treinamento-card">
                    <h4>${treinamento.titulo}</h4>
                    <strong>${treinamento.funcionarioNome || 'Funcionário não informado'}</strong>
                    <p>${treinamento.descricao}</p>
                    <div class="treinamento-info">
                        <span><i class="fas fa-users"></i> ${treinamento.participantes?.length || 0} participantes</span>
                        <span><i class="fas fa-calendar"></i> ${new Date(treinamento.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">Nenhum treinamento cadastrado.</p>';
        }
    }

    openTreinamentoModal() {
        const modal = document.getElementById('treinamentoModal');
        const funcionarioSelect = document.getElementById('funcionarioTreinamento');
        const form = document.getElementById('treinamentoForm');

        if (!modal || !funcionarioSelect || !form) return;

        funcionarioSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
        storageManager.getFuncionarios().forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario.id;
            option.textContent = funcionario.nome;
            funcionarioSelect.appendChild(option);
        });
        form.reset();
        document.getElementById('dataTreinamento').value = new Date().toISOString().split('T')[0];
        modal.classList.add('active');
    }

    closeTreinamentoModal() {
        const modal = document.getElementById('treinamentoModal');
        if (modal) modal.classList.remove('active');
    }

    handleTreinamentoSubmit(e) {
        e.preventDefault();

        const funcionarioId = document.getElementById('funcionarioTreinamento').value;
        const funcionario = storageManager.getFuncionarioById(funcionarioId);
        const treinamento = {
            titulo: document.getElementById('tituloTreinamento').value.trim(),
            tipo: document.getElementById('tipoTreinamento').value,
            data: document.getElementById('dataTreinamento').value,
            descricao: document.getElementById('descricaoTreinamento').value.trim(),
            funcionarioId,
            funcionarioNome: funcionario ? funcionario.nome : '',
            participantes: funcionario ? [funcionarioId] : []
        };

        if (!funcionario || !treinamento.titulo || !treinamento.descricao) {
            this.showToast('Preencha todos os campos obrigatórios.', 'error');
            return;
        }

        const novoTreinamento = storageManager.addTreinamento(treinamento);
        if (!novoTreinamento) {
            this.showToast('Erro ao cadastrar treinamento.', 'error');
            return;
        }

        this.closeTreinamentoModal();
        this.loadTreinamentos();
        this.showToast('Treinamento cadastrado com sucesso!', 'success');
    }

    loadAvaliacoes() {
        const avaliacoes = storageManager.getAvaliacoes();
        const container = document.getElementById('avaliacoesContainer');
        
        if (container) {
            container.innerHTML = avaliacoes.length ? avaliacoes.map(avaliacao => `
                <div class="avaliacao-card">
                    <div class="avaliacao-header">
                        <h4>${avaliacao.funcionarioNome}</h4>
                        <div class="avaliacao-nota">
                            ${'★'.repeat(Math.round(avaliacao.nota / 2))}${'☆'.repeat(5 - Math.round(avaliacao.nota / 2))}
                        </div>
                    </div>
                    <p>${avaliacao.observacoes}</p>
                    <div class="avaliacao-data">
                        ${new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="actions">
                        <button class="btn btn-small btn-secondary" data-avaliacao-action="edit" data-id="${avaliacao.id}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" data-avaliacao-action="delete" data-id="${avaliacao.id}" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">Nenhuma avaliação cadastrada.</p>';
        }
    }

    openAvaliacaoModal(id = null) {
        const modal = document.getElementById('avaliacaoModal');
        const form = document.getElementById('avaliacaoForm');
        const funcionarioSelect = document.getElementById('funcionarioAvaliacao');
        const title = document.getElementById('avaliacaoModalTitle');
        if (!modal || !form || !funcionarioSelect) return;

        this.currentAvaliacaoId = id;
        funcionarioSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
        storageManager.getFuncionarios().forEach(funcionario => {
            const option = document.createElement('option');
            option.value = funcionario.id;
            option.textContent = funcionario.nome;
            funcionarioSelect.appendChild(option);
        });

        form.reset();
        document.getElementById('dataAvaliacao').value = new Date().toISOString().split('T')[0];
        title.textContent = id ? 'Editar Avaliação' : 'Nova Avaliação';

        if (id) {
            const avaliacao = storageManager.getAvaliacoes().find(item => String(item.id) === String(id));
            if (avaliacao) {
                funcionarioSelect.value = avaliacao.funcionarioId || '';
                document.getElementById('tipoAvaliacao').value = avaliacao.tipo || '';
                document.getElementById('notaAvaliacao').value = avaliacao.nota ?? '';
                document.getElementById('dataAvaliacao').value = avaliacao.data || '';
                document.getElementById('observacoesAvaliacao').value = avaliacao.observacoes || '';
            }
        }
        modal.classList.add('active');
    }

    closeAvaliacaoModal() {
        const modal = document.getElementById('avaliacaoModal');
        if (modal) modal.classList.remove('active');
        this.currentAvaliacaoId = null;
    }

    handleAvaliacaoSubmit(e) {
        e.preventDefault();
        const funcionarioId = document.getElementById('funcionarioAvaliacao').value;
        const funcionario = storageManager.getFuncionarioById(funcionarioId);
        const avaliacao = {
            funcionarioId,
            funcionarioNome: funcionario ? funcionario.nome : '',
            tipo: document.getElementById('tipoAvaliacao').value,
            nota: Number(document.getElementById('notaAvaliacao').value),
            data: document.getElementById('dataAvaliacao').value,
            observacoes: document.getElementById('observacoesAvaliacao').value.trim()
        };

        if (!funcionario || !avaliacao.tipo || avaliacao.nota < 0 || avaliacao.nota > 10 || !avaliacao.data || !avaliacao.observacoes) {
            this.showToast('Preencha os campos obrigatórios corretamente.', 'error');
            return;
        }

        const sucesso = this.currentAvaliacaoId
            ? storageManager.updateAvaliacao(this.currentAvaliacaoId, avaliacao)
            : storageManager.addAvaliacao(avaliacao);
        if (!sucesso) {
            this.showToast('Erro ao salvar avaliação.', 'error');
            return;
        }

        this.closeAvaliacaoModal();
        this.loadAvaliacoes();
        this.showToast('Avaliação salva com sucesso!', 'success');
    }

    deleteAvaliacao(id) {
        if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;
        if (storageManager.deleteAvaliacao(id)) {
            this.loadAvaliacoes();
            this.showToast('Avaliação excluída com sucesso!', 'success');
        }
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});