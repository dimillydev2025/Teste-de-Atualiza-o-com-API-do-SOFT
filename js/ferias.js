/**
 * Férias Manager - Soft RH
 * Gerenciamento de férias e períodos de descanso
 */

class FeriasManager {
    constructor() {
        this.currentFerias = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFerias();
    }

    setupEventListeners() {
        // Botão de adicionar férias
        const addBtn = document.getElementById('addFerias');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Formulário de férias
        const form = document.getElementById('feriasForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Botão de cancelar
        const cancelBtn = document.getElementById('cancelFerias');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Botão de fechar modal
        const closeBtn = document.getElementById('closeFeriasModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Filtros
        const statusFilter = document.getElementById('statusFeriasFilter');
        const anoFilter = document.getElementById('anoFeriasFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadFerias());
        }
        
        if (anoFilter) {
            anoFilter.addEventListener('change', () => this.loadFerias());
        }

        // Campos de data
        const dataInicio = document.getElementById('dataInicioFerias');
        const dataFim = document.getElementById('dataFimFerias');
        
        if (dataInicio && dataFim) {
            dataInicio.addEventListener('change', () => this.calcularDiasFerias());
            dataFim.addEventListener('change', () => this.calcularDiasFerias());
        }
    }

    loadFerias() {
        const ferias = storageManager.getFerias();
        const statusFilter = document.getElementById('statusFeriasFilter')?.value;
        const anoFilter = document.getElementById('anoFeriasFilter')?.value;
        
        let filteredFerias = ferias;
        
        if (statusFilter) {
            filteredFerias = ferias.filter(f => f.status === statusFilter);
        }
        
        if (anoFilter) {
            filteredFerias = filteredFerias.filter(f => f.ano === anoFilter);
        }

        this.currentFerias = filteredFerias.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
        this.renderFerias();
        this.updateFuncionariosSelect();
    }

    renderFerias() {
        const container = document.getElementById('feriasContainer');
        if (!container) return;

        if (this.currentFerias.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-16); color: var(--gray-500);">
                    <i class="fas fa-umbrella-beach" style="font-size: 4rem; margin-bottom: var(--spacing-4); opacity: 0.3;"></i>
                    <h3 style="color: var(--gray-600); margin-bottom: var(--spacing-2);">Nenhuma solicitação de férias</h3>
                    <p style="font-size: var(--font-size-sm);">Clique em "Solicitar Férias" para criar uma nova solicitação</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.currentFerias.map(ferias => {
            const funcionario = storageManager.getFuncionarios().find(f => f.id === ferias.funcionarioId);
            const funcionarioNome = funcionario ? funcionario.nome : 'Funcionário não encontrado';
            const diasTotais = this.calcularDiasUteis(ferias.dataInicio, ferias.dataFim);
            const diasDecorridos = this.calcularDiasDecorridos(ferias.dataInicio);
            
            return `
                <div class="ferias-card">
                    <div class="ferias-header">
                        <div>
                            <div class="ferias-funcionario">${funcionarioNome}</div>
                            <div class="ferias-periodo">${new Date(ferias.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(ferias.dataFim).toLocaleDateString('pt-BR')}</div>
                        </div>
                        <span class="ferias-status status-${ferias.status}">${this.getStatusText(ferias.status)}</span>
                    </div>
                    
                    <div class="ferias-detalhes">
                        <div class="ferias-detalhe-item">
                            <span class="valor">${ferias.dias}</span>
                            <span class="label">Dias</span>
                        </div>
                        <div class="ferias-detalhe-item">
                            <span class="valor">${ferias.tipo === 'venda' ? 'Sim' : 'Não'}</span>
                            <span class="label">Venda 1/3</span>
                        </div>
                        <div class="ferias-detalhe-item">
                            <span class="valor">${ferias.ano}</span>
                            <span class="label">Ano</span>
                        </div>
                        <div class="ferias-detalhe-item">
                            <span class="valor">${diasDecorridos}</span>
                            <span class="label">Decorridos</span>
                        </div>
                    </div>
                    
                    ${ferias.observacoes ? `
                        <div style="margin-bottom: var(--spacing-4);">
                            <strong>Observações:</strong>
                            <p style="color: var(--gray-600); font-size: var(--font-size-sm); margin-top: var(--spacing-1);">${ferias.observacoes}</p>
                        </div>
                    ` : ''}
                    
                    <div class="ferias-actions">
                        ${ferias.status === 'pendente' ? `
                            <button class="btn btn-small btn-success" onclick="window.feriasManager.aprovarFerias('${ferias.id}')" title="Aprovar">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-small btn-danger" onclick="window.feriasManager.negarFerias('${ferias.id}')" title="Negar">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-small btn-primary" onclick="window.feriasManager.viewFerias('${ferias.id}')" title="Visualizar">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="window.feriasManager.printFerias('${ferias.id}')" title="Imprimir">
                            <i class="fas fa-print"></i>
                        </button>
                        ${ferias.status === 'pendente' ? `
                            <button class="btn btn-small btn-danger" onclick="window.feriasManager.deleteFerias('${ferias.id}')" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateFuncionariosSelect() {
        const selects = ['funcionarioFerias'];
        const funcionarios = storageManager.getFuncionarios().filter(f => f.status === 'ativo');

        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Selecione um funcionário</option>' +
                    funcionarios.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
            }
        });
    }

    calcularDiasFerias() {
        const dataInicio = document.getElementById('dataInicioFerias')?.value;
        const dataFim = document.getElementById('dataFimFerias')?.value;
        const diasInput = document.getElementById('diasFerias');

        if (dataInicio && dataFim && diasInput) {
            const dias = this.calcularDiasUteis(dataInicio, dataFim);
            diasInput.value = dias;
        }
    }

    calcularDiasUteis(dataInicio, dataFim) {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        let diasUteis = 0;
        
        const data = new Date(inicio);
        while (data <= fim) {
            const diaSemana = data.getDay();
            if (diaSemana !== 0 && diaSemana !== 6) { // Não conta sábado e domingo
                diasUteis++;
            }
            data.setDate(data.getDate() + 1);
        }
        
        return diasUteis;
    }

    calcularDiasDecorridos(dataInicio) {
        const hoje = new Date();
        const inicio = new Date(dataInicio);
        
        if (hoje < inicio) return 0;
        
        const diffTime = Math.abs(hoje - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    getStatusText(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'aprovado': 'Aprovado',
            'negado': 'Negado',
            'em_andamento': 'Em Andamento',
            'concluido': 'Concluído'
        };
        return statusMap[status] || status;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const funcionarioId = document.getElementById('funcionarioFerias').value;
        const ano = document.getElementById('anoFerias').value;
        const dataInicio = document.getElementById('dataInicioFerias').value;
        const dataFim = document.getElementById('dataFimFerias').value;
        const dias = document.getElementById('diasFerias').value;
        const tipo = document.getElementById('tipoFerias').value;
        const observacoes = document.getElementById('observacoesFerias').value;

        // Verificar se já existe solicitação para este funcionário neste período
        const feriasExistente = this.currentFerias.find(f => 
            f.funcionarioId === funcionarioId && 
            f.ano === ano && 
            f.status !== 'negado' &&
            f.status !== 'concluido'
        );

        if (feriasExistente) {
            alert('Este funcionário já possui uma solicitação de férias em andamento para este ano.');
            return;
        }

        const ferias = {
            id: storageManager.generateId(),
            funcionarioId: funcionarioId,
            ano: ano,
            dataInicio: dataInicio,
            dataFim: dataFim,
            dias: parseInt(dias),
            tipo: tipo,
            observacoes: observacoes,
            status: 'pendente',
            dataCriacao: new Date().toISOString(),
            aprovadoPor: null,
            dataAprovacao: null
        };

        storageManager.addFerias(ferias);
        this.loadFerias();
        this.closeModal();
        window.app.showToast('Solicitação de férias enviada com sucesso!', 'success');
    }

    aprovarFerias(id) {
        if (confirm('Tem certeza que deseja aprovar esta solicitação de férias?')) {
            const ferias = storageManager.getFerias().find(f => f.id === id);
            if (ferias) {
                ferias.status = 'aprovado';
                ferias.aprovadoPor = 'Administrador';
                ferias.dataAprovacao = new Date().toISOString();
                storageManager.updateFerias(id, ferias);
                this.loadFerias();
                window.app.showToast('Férias aprovadas com sucesso!', 'success');
            }
        }
    }

    negarFerias(id) {
        const motivo = prompt('Por qual motivo deseja negar esta solicitação de férias?');
        if (motivo !== null) {
            const ferias = storageManager.getFerias().find(f => f.id === id);
            if (ferias) {
                ferias.status = 'negado';
                ferias.motivoNegacao = motivo;
                ferias.aprovadoPor = 'Administrador';
                ferias.dataAprovacao = new Date().toISOString();
                storageManager.updateFerias(id, ferias);
                this.loadFerias();
                window.app.showToast('Férias negadas com sucesso!', 'info');
            }
        }
    }

    viewFerias(id) {
        const ferias = storageManager.getFerias().find(f => f.id === id);
        if (!ferias) {
            window.app.showToast('Solicitação de férias não encontrada.', 'error');
            return;
        }

        const funcionario = storageManager.getFuncionarios().find(f => f.id === ferias.funcionarioId);
        const funcionarioNome = funcionario ? funcionario.nome : 'Funcionário não encontrado';

        alert(`Detalhes da Solicitação de Férias:

Funcionário: ${funcionarioNome}
Período: ${new Date(ferias.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(ferias.dataFim).toLocaleDateString('pt-BR')}
Dias: ${ferias.dias}
Tipo: ${this.getTipoText(ferias.tipo)}
Status: ${this.getStatusText(ferias.status)}
${ferias.observacoes ? `Observações: ${ferias.observacoes}` : ''}
${ferias.motivoNegacao ? `Motivo da negação: ${ferias.motivoNegacao}` : ''}`);
    }

    getTipoText(tipo) {
        const tipos = {
            'completa': 'Férias Completas',
            'parcial': 'Férias Parciais',
            'antecipacao': 'Antecipação de Férias',
            'venda': 'Venda de 1/3 de Férias'
        };
        return tipos[tipo] || tipo;
    }

    printFerias(id) {
        const ferias = storageManager.getFerias().find(f => f.id === id);
        if (!ferias) {
            window.app.showToast('Solicitação de férias não encontrada.', 'error');
            return;
        }

        const funcionario = storageManager.getFuncionarios().find(f => f.id === ferias.funcionarioId);
        const funcionarioNome = funcionario ? funcionario.nome : 'Funcionário não encontrado';

        // Criar janela de impressão
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Comprovante de Férias - ${funcionarioNome}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6a1b9a; padding-bottom: 20px; }
                    .content { margin: 20px 0; }
                    .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f5f5f5; }
                    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>COMPROVANTE DE FÉRIAS</h1>
                    <p>Soft RH - Sistema de Gestão de Recursos Humanos</p>
                </div>
                
                <div class="content">
                    <div class="info-row">
                        <strong>Funcionário:</strong>
                        <span>${funcionarioNome}</span>
                    </div>
                    <div class="info-row">
                        <strong>Período:</strong>
                        <span>${new Date(ferias.dataInicio).toLocaleDateString('pt-BR')} - ${new Date(ferias.dataFim).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="info-row">
                        <strong>Dias de Férias:</strong>
                        <span>${ferias.dias}</span>
                    </div>
                    <div class="info-row">
                        <strong>Tipo de Férias:</strong>
                        <span>${this.getTipoText(ferias.tipo)}</span>
                    </div>
                    <div class="info-row">
                        <strong>Status:</strong>
                        <span>${this.getStatusText(ferias.status)}</span>
                    </div>
                    <div class="info-row">
                        <strong>Ano de Referência:</strong>
                        <span>${ferias.ano}</span>
                    </div>
                    ${ferias.observacoes ? `
                    <div class="info-row" style="flex-direction: column; align-items: flex-start;">
                        <strong>Observações:</strong>
                        <p style="margin-top: 5px;">${ferias.observacoes}</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="footer">
                    <p>Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                    <p>Soft RH - Sistema de Gestão de Recursos Humanos</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    deleteFerias(id) {
        if (confirm('Tem certeza que deseja excluir esta solicitação de férias?')) {
            storageManager.deleteFerias(id);
            this.loadFerias();
            window.app.showToast('Solicitação de férias excluída com sucesso!', 'success');
        }
    }

    openModal() {
        const modal = document.getElementById('feriasModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('feriasForm').reset();
            
            // Definir data mínima como hoje
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('dataInicioFerias').min = hoje;
        }
    }

    closeModal() {
        const modal = document.getElementById('feriasModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Inicialização
window.feriasManager = new FeriasManager();