/**
 * Gerenciamento de Funcionários - Soft RH
 * CRUD completo para funcionários
 */

class FuncionariosManager {
    constructor() {
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFuncionarios();
    }

    setupEventListeners() {
        // Botão adicionar funcionário
        const addBtn = document.getElementById('addFuncionario');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openFuncionarioModal());
        }

        // Formulário de funcionário
        const form = document.getElementById('funcionarioForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFuncionarioSubmit(e));
        }

        // Botões de cancelar e fechar modal
        const cancelBtn = document.getElementById('cancelFuncionario');
        const closeBtn = document.getElementById('closeFuncionarioModal');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeFuncionarioModal());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFuncionarioModal());
        }

        // Filtros
        const departamentoFilter = document.getElementById('departamentoFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (departamentoFilter) {
            departamentoFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    loadFuncionarios() {
        const funcionarios = storageManager.getFuncionarios();
        this.displayFuncionarios(funcionarios);
    }

    displayFuncionarios(funcionarios) {
        const tbody = document.getElementById('funcionariosTableBody');
        
        if (!tbody) return;

        if (funcionarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: var(--gray-500);">
                        <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Nenhum funcionário cadastrado</p>
                        <button class="btn btn-primary" onclick="window.funcionariosManager.openFuncionarioModal()">
                            <i class="fas fa-plus"></i> Adicionar Primeiro Funcionário
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = funcionarios.map(funcionario => `
            <tr>
                <td>#${funcionario.id.substring(0, 8)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.875rem;">
                            ${funcionario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight: 600; color: var(--gray-800);">${funcionario.nome}</div>
                            <div style="font-size: 0.75rem; color: var(--gray-500);">${funcionario.email}</div>
                        </div>
                    </div>
                </td>
                <td>${funcionario.cargo}</td>
                <td>
                    <span class="status-badge" style="background-color: ${this.getDepartamentoColor(funcionario.departamento)}20; color: ${this.getDepartamentoColor(funcionario.departamento)};">
                        ${funcionario.departamento}
                    </span>
                </td>
                <td>${funcionario.email}</td>
                <td>${new Date(funcionario.dataAdmissao).toLocaleDateString('pt-BR')}</td>
                <td>
                    <span class="status-badge status-${funcionario.status}">
                        ${funcionario.status === 'ativo' ? 'Ativo' : funcionario.status === 'ferias' ? 'De Férias' : 'Afastado'}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn btn-small btn-secondary" onclick="window.funcionariosManager.editFuncionario('${funcionario.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="window.funcionariosManager.deleteFuncionario('${funcionario.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getDepartamentoColor(departamento) {
        const colors = {
            'TI': '#2563eb',
            'RH': '#10b981',
            'Vendas': '#f59e0b',
            'Marketing': '#8b5cf6',
            'Financeiro': '#ef4444'
        };
        return colors[departamento] || '#6b7280';
    }

    openFuncionarioModal(funcionarioId = null) {
        const modal = document.getElementById('funcionarioModal');
        const form = document.getElementById('funcionarioForm');
        const title = document.getElementById('funcionarioModalTitle');

        if (!modal || !form) return;

        this.currentEditId = funcionarioId;

        if (funcionarioId) {
            // Modo edição
            title.textContent = 'Editar Funcionário';
            const funcionario = storageManager.getFuncionarioById(funcionarioId);
            if (funcionario) {
                this.populateFuncionarioForm(funcionario);
            }
        } else {
            // Modo adicionar
            title.textContent = 'Adicionar Funcionário';
            form.reset();
            // Define valores padrão
            document.getElementById('status').value = 'ativo';
            document.getElementById('dataAdmissao').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('active');
    }

    closeFuncionarioModal() {
        const modal = document.getElementById('funcionarioModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditId = null;
    }

    populateFuncionarioForm(funcionario) {
        const fields = ['nome', 'email', 'cargo', 'departamento', 'dataAdmissao', 'salario', 'telefone', 'status'];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && funcionario[field] !== undefined) {
                element.value = funcionario[field];
            }
        });
    }

    handleFuncionarioSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const funcionario = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            cargo: document.getElementById('cargo').value,
            departamento: document.getElementById('departamento').value,
            dataAdmissao: document.getElementById('dataAdmissao').value,
            salario: parseFloat(document.getElementById('salario').value) || 0,
            telefone: document.getElementById('telefone').value,
            status: document.getElementById('status').value
        };

        // Validações
        if (!this.validateFuncionario(funcionario)) {
            return;
        }

        let sucesso = false;

        if (this.currentEditId) {
            // Atualizar funcionário existente
            sucesso = storageManager.updateFuncionario(this.currentEditId, funcionario);
            if (sucesso) {
                window.app.showToast('Funcionário atualizado com sucesso!', 'success');
            }
        } else {
            // Criar novo funcionário
            const novoFuncionario = storageManager.addFuncionario(funcionario);
            if (novoFuncionario) {
                sucesso = true;
                window.app.showToast('Funcionário adicionado com sucesso!', 'success');
            }
        }

        if (sucesso) {
            this.closeFuncionarioModal();
            this.loadFuncionarios();
            
            // Atualiza dashboard se estiver visível
            if (window.app && window.app.currentSection === 'dashboard') {
                window.app.updateDashboard();
            }
        } else {
            window.app.showToast('Erro ao salvar funcionário', 'error');
        }
    }

    validateFuncionario(funcionario) {
        const errors = [];

        if (!funcionario.nome || funcionario.nome.trim().length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }

        if (!funcionario.email || !this.isValidEmail(funcionario.email)) {
            errors.push('Email inválido');
        }

        if (!funcionario.cargo || funcionario.cargo.trim().length < 2) {
            errors.push('Cargo deve ter pelo menos 2 caracteres');
        }

        if (!funcionario.departamento) {
            errors.push('Departamento é obrigatório');
        }

        if (!funcionario.dataAdmissao) {
            errors.push('Data de admissão é obrigatória');
        }

        if (funcionario.salario < 0) {
            errors.push('Salário não pode ser negativo');
        }

        if (errors.length > 0) {
            window.app.showToast(errors[0], 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    editFuncionario(id) {
        this.openFuncionarioModal(id);
    }

    deleteFuncionario(id) {
        if (confirm('Tem certeza que deseja excluir este funcionário?')) {
            const sucesso = storageManager.deleteFuncionario(id);
            
            if (sucesso) {
                window.app.showToast('Funcionário excluído com sucesso!', 'success');
                this.loadFuncionarios();
                
                // Atualiza dashboard se estiver visível
                if (window.app && window.app.currentSection === 'dashboard') {
                    window.app.updateDashboard();
                }
            } else {
                window.app.showToast('Erro ao excluir funcionário', 'error');
            }
        }
    }

    applyFilters() {
        const departamento = document.getElementById('departamentoFilter').value;
        const status = document.getElementById('statusFilter').value;

        const filtros = {};
        if (departamento) filtros.departamento = departamento;
        if (status) filtros.status = status;

        const funcionariosFiltrados = storageManager.filterFuncionarios(filtros);
        this.displayFuncionarios(funcionariosFiltrados);
    }

    // Métodos estatísticos
    getEstatisticasPorDepartamento() {
        const funcionarios = storageManager.getFuncionarios();
        const estatisticas = {};

        funcionarios.forEach(f => {
            if (!estatisticas[f.departamento]) {
                estatisticas[f.departamento] = 0;
            }
            estatisticas[f.departamento]++;
        });

        return estatisticas;
    }

    getEstatisticasPorStatus() {
        const funcionarios = storageManager.getFuncionarios();
        const estatisticas = {
            ativo: 0,
            ferias: 0,
            afastado: 0
        };

        funcionarios.forEach(f => {
            if (estatisticas[f.status] !== undefined) {
                estatisticas[f.status]++;
            }
        });

        return estatisticas;
    }

    getAniversariantesDoMes() {
        const funcionarios = storageManager.getFuncionarios();
        const mesAtual = new Date().getMonth();

        return funcionarios.filter(f => {
            const dataNascimento = new Date(f.dataNascimento);
            return dataNascimento.getMonth() === mesAtual;
        });
    }

    getFuncionariosRecentes(dias = 30) {
        const funcionarios = storageManager.getFuncionarios();
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - dias);

        return funcionarios.filter(f => {
            const dataAdmissao = new Date(f.dataAdmissao);
            return dataAdmissao >= dataLimite;
        });
    }

    // Exportação de dados
    exportarFuncionarios() {
        const funcionarios = storageManager.getFuncionarios();
        const csv = this.convertToCSV(funcionarios);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `funcionarios-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        window.app.showToast('Funcionários exportados com sucesso!', 'success');
    }

    convertToCSV(data) {
        const headers = ['Nome', 'Email', 'Cargo', 'Departamento', 'Data Admissão', 'Salário', 'Status'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.nome,
                row.email,
                row.cargo,
                row.departamento,
                new Date(row.dataAdmissao).toLocaleDateString('pt-BR'),
                row.salario || 0,
                row.status
            ].map(field => `"${field}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }
}

// Inicialização
window.funcionariosManager = new FuncionariosManager();

