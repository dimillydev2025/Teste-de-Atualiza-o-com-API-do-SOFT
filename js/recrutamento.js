/**
 * Gerenciamento de Recrutamento - Soft RH
 * CRUD para vagas e processos seletivos
 */

class RecrutamentoManager {
    constructor() {
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadVagas();
    }

    setupEventListeners() {
        // Botão adicionar vaga
        const addBtn = document.getElementById('addVaga');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openVagaModal());
        }

        // Formulário de vaga
        const form = document.getElementById('vagaForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleVagaSubmit(e));
        }

        // Botões de cancelar e fechar modal
        const cancelBtn = document.getElementById('cancelVaga');
        const closeBtn = document.getElementById('closeVagaModal');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeVagaModal());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeVagaModal());
        }
    }

    loadVagas() {
        const vagas = storageManager.getVagas();
        this.displayVagas(vagas);
    }

    displayVagas(vagas) {
        const container = document.getElementById('vagasGrid');
        
        if (!container) return;

        if (vagas.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-500);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 style="margin-bottom: 0.5rem;">Nenhuma vaga cadastrada</h3>
                    <p style="margin-bottom: 1.5rem;">Comece criando sua primeira vaga!</p>
                    <button class="btn btn-primary" onclick="window.recrutamentoManager.openVagaModal()">
                        <i class="fas fa-plus"></i> Criar Primeira Vaga
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = vagas.map(vaga => `
            <div class="vaga-card">
                <div class="vaga-header">
                    <div>
                        <h4 class="vaga-title">${vaga.titulo}</h4>
                        <div class="vaga-departamento">
                            <i class="fas fa-building"></i> ${vaga.departamento}
                        </div>
                    </div>
                    <div class="vaga-status">
                        <span class="status-badge ${this.getVagaStatusClass(vaga.status)}">
                            ${this.getVagaStatusText(vaga.status)}
                        </span>
                    </div>
                </div>
                
                <div class="vaga-description">
                    ${vaga.descricao}
                </div>
                
                ${vaga.requisitos ? `
                    <div class="vaga-requisitos">
                        <strong>Requisitos:</strong>
                        <p>${vaga.requisitos}</p>
                    </div>
                ` : ''}
                
                <div class="vaga-info">
                    <div class="vaga-date">
                        <i class="fas fa-calendar"></i>
                        Criada em ${new Date(vaga.dataCriacao).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="vaga-candidates">
                        <i class="fas fa-user-friends"></i>
                        ${vaga.candidatos ? vaga.candidatos.length : 0} candidatos
                    </div>
                </div>
                
                <div class="vaga-actions">
                    <button class="btn btn-small btn-secondary" onclick="window.recrutamentoManager.editVaga('${vaga.id}')" title="Editar">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-small btn-primary" onclick="window.recrutamentoManager.viewCandidatos('${vaga.id}')" title="Ver Candidatos">
                        <i class="fas fa-users"></i> Candidatos
                    </button>
                    <button class="btn btn-small ${vaga.status === 'aberta' ? 'btn-warning' : 'btn-success'}" 
                            onclick="window.recrutamentoManager.toggleVagaStatus('${vaga.id}')" 
                            title="${vaga.status === 'aberta' ? 'Fechar' : 'Reabrir'} Vaga">
                        <i class="fas fa-${vaga.status === 'aberta' ? 'times' : 'check'}"></i>
                        ${vaga.status === 'aberta' ? 'Fechar' : 'Reabrir'}
                    </button>
                    <button class="btn btn-small btn-danger" onclick="window.recrutamentoManager.deleteVaga('${vaga.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getVagaStatusClass(status) {
        const classes = {
            'aberta': 'status-ativo',
            'fechada': 'status-afastado',
            'pausada': 'status-ferias',
            'preenchida': 'status-success'
        };
        return classes[status] || 'status-ferias';
    }

    getVagaStatusText(status) {
        const texts = {
            'aberta': 'Aberta',
            'fechada': 'Fechada',
            'pausada': 'Pausada',
            'preenchida': 'Preenchida'
        };
        return texts[status] || status;
    }

    openVagaModal(vagaId = null) {
        const modal = document.getElementById('vagaModal');
        const form = document.getElementById('vagaForm');
        const title = document.getElementById('vagaModalTitle');

        if (!modal || !form) return;

        this.currentEditId = vagaId;

        if (vagaId) {
            // Modo edição
            title.textContent = 'Editar Vaga';
            const vaga = storageManager.getVagas().find(v => v.id === vagaId);
            if (vaga) {
                this.populateVagaForm(vaga);
            }
        } else {
            // Modo adicionar
            title.textContent = 'Nova Vaga';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeVagaModal() {
        const modal = document.getElementById('vagaModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentEditId = null;
    }

    populateVagaForm(vaga) {
        const fields = ['tituloVaga', 'departamentoVaga', 'descricaoVaga', 'requisitosVaga'];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            const fieldName = fieldId.replace('Vaga', '').replace(/([A-Z])/g, '_$1').toLowerCase();
            const vagaFieldName = fieldName === 'titulo' ? 'titulo' : fieldName;
            
            if (element && vaga[vagaFieldName] !== undefined) {
                element.value = vaga[vagaFieldName];
            }
        });
    }

    handleVagaSubmit(e) {
        e.preventDefault();
        
        const vaga = {
            titulo: document.getElementById('tituloVaga').value,
            departamento: document.getElementById('departamentoVaga').value,
            descricao: document.getElementById('descricaoVaga').value,
            requisitos: document.getElementById('requisitosVaga').value
        };

        // Validações
        if (!this.validateVaga(vaga)) {
            return;
        }

        let sucesso = false;

        if (this.currentEditId) {
            // Atualizar vaga existente
            sucesso = storageManager.updateVaga(this.currentEditId, vaga);
            if (sucesso) {
                window.app.showToast('Vaga atualizada com sucesso!', 'success');
            }
        } else {
            // Criar nova vaga
            const novaVaga = storageManager.addVaga(vaga);
            if (novaVaga) {
                sucesso = true;
                window.app.showToast('Vaga criada com sucesso!', 'success');
            }
        }

        if (sucesso) {
            this.closeVagaModal();
            this.loadVagas();
        } else {
            window.app.showToast('Erro ao salvar vaga', 'error');
        }
    }

    validateVaga(vaga) {
        const errors = [];

        if (!vaga.titulo || vaga.titulo.trim().length < 5) {
            errors.push('Título deve ter pelo menos 5 caracteres');
        }

        if (!vaga.departamento) {
            errors.push('Departamento é obrigatório');
        }

        if (!vaga.descricao || vaga.descricao.trim().length < 20) {
            errors.push('Descrição deve ter pelo menos 20 caracteres');
        }

        if (errors.length > 0) {
            window.app.showToast(errors[0], 'error');
            return false;
        }

        return true;
    }

    editVaga(id) {
        this.openVagaModal(id);
    }

    deleteVaga(id) {
        if (confirm('Tem certeza que deseja excluir esta vaga?')) {
            const sucesso = storageManager.deleteVaga(id);
            
            if (sucesso) {
                window.app.showToast('Vaga excluída com sucesso!', 'success');
                this.loadVagas();
            } else {
                window.app.showToast('Erro ao excluir vaga', 'error');
            }
        }
    }

    toggleVagaStatus(id) {
        const vagas = storageManager.getVagas();
        const vaga = vagas.find(v => v.id === id);
        
        if (!vaga) return;

        const novoStatus = vaga.status === 'aberta' ? 'fechada' : 'aberta';
        
        const sucesso = storageManager.updateVaga(id, { status: novoStatus });
        
        if (sucesso) {
            window.app.showToast(`Vaga ${novoStatus === 'aberta' ? 'reaberta' : 'fechada'} com sucesso!`, 'success');
            this.loadVagas();
        } else {
            window.app.showToast('Erro ao alterar status da vaga', 'error');
        }
    }

    viewCandidatos(vagaId) {
        const vagas = storageManager.getVagas();
        const vaga = vagas.find(v => v.id === vagaId);
        
        if (!vaga) return;

        // Cria modal de candidatos
        this.createCandidatosModal(vaga);
    }

    createCandidatosModal(vaga) {
        // Remove modal anterior se existir
        const modalExistente = document.getElementById('candidatosModal');
        if (modalExistente) {
            modalExistente.remove();
        }

        // Cria novo modal
        const modal = document.createElement('div');
        modal.id = 'candidatosModal';
        modal.className = 'modal';
        
        const candidatos = vaga.candidatos || [];
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Candidatos - ${vaga.titulo}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="padding: 1.5rem;">
                    <div class="section-actions" style="margin-bottom: 1.5rem;">
                        <button class="btn btn-primary" onclick="window.recrutamentoManager.addCandidato('${vaga.id}')">
                            <i class="fas fa-plus"></i> Adicionar Candidato
                        </button>
                    </div>
                    
                    ${candidatos.length === 0 ? `
                        <div style="text-align: center; padding: 2rem; color: var(--gray-500);">
                            <i class="fas fa-user-friends" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                            <p>Nenhum candidato para esta vaga ainda</p>
                        </div>
                    ` : `
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Email</th>
                                        <th>Telefone</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${candidatos.map((candidato, index) => `
                                        <tr>
                                            <td>${candidato.nome}</td>
                                            <td>${candidato.email}</td>
                                            <td>${candidato.telefone || '-'}</td>
                                            <td>
                                                <span class="status-badge ${this.getCandidatoStatusClass(candidato.status)}">
                                                    ${this.getCandidatoStatusText(candidato.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="actions">
                                                    <button class="btn btn-small btn-secondary" 
                                                            onclick="window.recrutamentoManager.editCandidato('${vaga.id}', ${index})" 
                                                            title="Editar">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn btn-small btn-success" 
                                                            onclick="window.recrutamentoServer.mudarStatusCandidato('${vaga.id}', ${index}, 'contratado')" 
                                                            title="Contratar"
                                                            ${candidato.status === 'contratado' ? 'disabled' : ''}>
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                    <button class="btn btn-small btn-danger" 
                                                            onclick="window.recrutamentoServer.removerCandidato('${vaga.id}', ${index})" 
                                                            title="Remover">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    addCandidato(vagaId) {
        const nome = prompt('Nome do candidato:');
        if (!nome) return;

        const email = prompt('Email do candidato:');
        if (!email) return;

        const telefone = prompt('Telefone do candidato (opcional):');

        const vagas = storageManager.getVagas();
        const vaga = vagas.find(v => v.id === vagaId);
        
        if (!vaga) return;

        if (!vaga.candidatos) {
            vaga.candidatos = [];
        }

        const novoCandidato = {
            id: storageManager.generateId(),
            nome: nome,
            email: email,
            telefone: telefone,
            status: 'em_analise',
            dataCadastro: new Date().toISOString()
        };

        vaga.candidatos.push(novoCandidato);
        
        const sucesso = storageManager.updateVaga(vagaId, { candidatos: vaga.candidatos });
        
        if (sucesso) {
            window.app.showToast('Candidato adicionado com sucesso!', 'success');
            this.viewCandidatos(vagaId); // Recarrega a modal
        } else {
            window.app.showToast('Erro ao adicionar candidato', 'error');
        }
    }

    getCandidatoStatusClass(status) {
        const classes = {
            'em_analise': 'status-ferias',
            'aprovado': 'status-success',
            'reprovado': 'status-afastado',
            'contratado': 'status-ativo'
        };
        return classes[status] || 'status-ferias';
    }

    getCandidatoStatusText(status) {
        const texts = {
            'em_analise': 'Em Análise',
            'aprovado': 'Aprovado',
            'reprovado': 'Reprovado',
            'contratado': 'Contratado'
        };
        return texts[status] || status;
    }

    // Estatísticas de recrutamento
    getEstatisticasRecrutamento() {
        const vagas = storageManager.getVagas();
        
        const stats = {
            totalVagas: vagas.length,
            vagasAbertas: vagas.filter(v => v.status === 'aberta').length,
            vagasPreenchidas: vagas.filter(v => v.status === 'preenchida').length,
            totalCandidatos: vagas.reduce((total, vaga) => total + (vaga.candidatos?.length || 0), 0)
        };

        // Calcula taxa de conversão média
        if (stats.totalCandidatos > 0) {
            const contratados = vagas.reduce((total, vaga) => {
                return total + (vaga.candidatos?.filter(c => c.status === 'contratado').length || 0);
            }, 0);
            stats.taxaConversao = Math.round((contratados / stats.totalCandidatos) * 100);
        } else {
            stats.taxaConversao = 0;
        }

        return stats;
    }

    // Relatórios
    gerarRelatorioVagas() {
        const vagas = storageManager.getVagas();
        const relatorio = {
            dataGeracao: new Date().toISOString(),
            totalVagas: vagas.length,
            vagasPorDepartamento: {},
            vagasPorStatus: {},
            candidatosPorVaga: {}
        };

        // Agrupa por departamento
        vagas.forEach(vaga => {
            if (!relatorio.vagasPorDepartamento[vaga.departamento]) {
                relatorio.vagasPorDepartamento[vaga.departamento] = 0;
            }
            relatorio.vagasPorDepartamento[vaga.departamento]++;

            if (!relatorio.vagasPorStatus[vaga.status]) {
                relatorio.vagasPorStatus[vaga.status] = 0;
            }
            relatorio.vagasPorStatus[vaga.status]++;

            relatorio.candidatosPorVaga[vaga.titulo] = vaga.candidatos?.length || 0;
        });

        return relatorio;
    }
}

// Inicialização
window.recrutamentoManager = new RecrutamentoManager();