/**
 * Documentos Manager - Soft RH
 * Gerenciamento de documentos e arquivos de RH
 */

class DocumentosManager {
    constructor() {
        this.currentDocuments = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDocumentos();
    }

    setupEventListeners() {
        // Botão de adicionar documento
        const addBtn = document.getElementById('addDocumento');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Formulário de documento
        const form = document.getElementById('documentoForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Botão de cancelar
        const cancelBtn = document.getElementById('cancelDocumento');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // Botão de fechar modal
        const closeBtn = document.getElementById('closeDocumentoModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Filtros
        const tipoFilter = document.getElementById('tipoDocumentoFilter');
        if (tipoFilter) {
            tipoFilter.addEventListener('change', () => this.loadDocumentos());
        }

        // Preview do arquivo
        const arquivoInput = document.getElementById('arquivoDocumento');
        if (arquivoInput) {
            arquivoInput.addEventListener('change', (e) => this.handleFileChange(e));
        }
    }

    loadDocumentos() {
        const documentos = storageManager.getDocumentos();
        const tipoFilter = document.getElementById('tipoDocumentoFilter')?.value;
        
        let filteredDocs = documentos;
        if (tipoFilter) {
            filteredDocs = documentos.filter(doc => doc.tipo === tipoFilter);
        }

        this.currentDocuments = filteredDocs;
        this.renderDocumentos();
        this.updateFuncionariosSelect();
    }

    renderDocumentos() {
        const tbody = document.getElementById('documentosTableBody');
        if (!tbody) return;

        if (this.currentDocuments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: var(--spacing-8); color: var(--gray-500);">
                        <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: var(--spacing-4); opacity: 0.3;"></i>
                        <p>Nenhum documento encontrado</p>
                        <p style="font-size: var(--font-size-sm);">Clique em "Adicionar Documento" para começar</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentDocuments.map(doc => {
            const statusClass = this.getStatusDocumento(doc);
            const statusText = this.getStatusText(doc);
            const funcionario = storageManager.getFuncionarios().find(f => f.id === doc.funcionarioId);
            const funcionarioNome = funcionario ? funcionario.nome : 'Funcionário não encontrado';

            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: var(--spacing-2);">
                            <div class="user-avatar" style="width: 32px; height: 32px; font-size: var(--font-size-sm);">
                                ${funcionarioNome.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                                <div style="font-weight: 600; color: var(--black);">${funcionarioNome}</div>
                                <div style="font-size: var(--font-size-xs); color: var(--gray-500);">${funcionario?.cargo || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="documento-tipo">${this.getTipoDocumentoText(doc.tipo)}</span>
                    </td>
                    <td>
                        <div style="font-weight: 500;">${doc.descricao}</div>
                        ${doc.dataValidade ? `<div style="font-size: var(--font-size-xs); color: var(--gray-500);">Válido até: ${new Date(doc.dataValidade).toLocaleDateString('pt-BR')}</div>` : ''}
                    </td>
                    <td>
                        <span class="status-documento ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-small btn-secondary" onclick="window.documentosManager.downloadDocumento('${doc.id}')" title="Baixar">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-small btn-primary" onclick="window.documentosManager.viewDocumento('${doc.id}')" title="Visualizar">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-small btn-danger" onclick="window.documentosManager.deleteDocumento('${doc.id}')" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateFuncionariosSelect() {
        const selects = ['funcionarioDocumento'];
        const funcionarios = storageManager.getFuncionarios().filter(f => f.status === 'ativo');

        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Selecione um funcionário</option>' +
                    funcionarios.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
            }
        });
    }

    getStatusDocumento(doc) {
        if (!doc.dataValidade) return 'status-documento-valido';
        
        const hoje = new Date();
        const validade = new Date(doc.dataValidade);
        const diasParaVencer = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

        if (diasParaVencer < 0) return 'status-documento-vencido';
        if (diasParaVencer <= 30) return 'status-documento-vencendo';
        return 'status-documento-valido';
    }

    getStatusText(doc) {
        if (!doc.dataValidade) return 'Válido';
        
        const hoje = new Date();
        const validade = new Date(doc.dataValidade);
        const diasParaVencer = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

        if (diasParaVencer < 0) return 'Vencido';
        if (diasParaVencer <= 30) return `Vence em ${diasParaVencer} dias`;
        return 'Válido';
    }

    getTipoDocumentoText(tipo) {
        const tipos = {
            'contrato': 'Contrato',
            'rg': 'RG',
            'cpf': 'CPF',
            'cnh': 'CNH',
            'certificado': 'Certificado',
            'outro': 'Outro'
        };
        return tipos[tipo] || tipo;
    }

    handleFileChange(e) {
        const file = e.target.files[0];
        if (file && file.size > 10 * 1024 * 1024) { // 10MB
            alert('Arquivo muito grande. O tamanho máximo é 10MB.');
            e.target.value = '';
            return;
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const arquivoInput = document.getElementById('arquivoDocumento');
        const arquivo = arquivoInput.files[0];

        if (!arquivo) {
            alert('Por favor, selecione um arquivo.');
            return;
        }

        // Simular upload do arquivo (em produção, faria upload real)
        const documento = {
            id: storageManager.generateId(),
            funcionarioId: document.getElementById('funcionarioDocumento').value,
            tipo: document.getElementById('tipoDocumento').value,
            descricao: document.getElementById('descricaoDocumento').value,
            dataValidade: document.getElementById('dataValidade').value,
            arquivo: {
                nome: arquivo.name,
                tamanho: arquivo.size,
                tipo: arquivo.type,
                dataUpload: new Date().toISOString()
            },
            status: 'ativo',
            dataCriacao: new Date().toISOString()
        };

        storageManager.addDocumento(documento);
        this.loadDocumentos();
        this.closeModal();
        window.app.showToast('Documento adicionado com sucesso!', 'success');
    }

    downloadDocumento(id) {
        const doc = this.currentDocuments.find(d => d.id === id);
        if (!doc || !doc.arquivo) {
            window.app.showToast('Documento não encontrado.', 'error');
            return;
        }

        // Simular download (em produção, faria download real do arquivo)
        const link = document.createElement('a');
        link.href = '#';
        link.download = `${doc.descricao}_${doc.arquivo.nome}`;
        link.click();
        
        window.app.showToast('Download iniciado!', 'info');
    }

    viewDocumento(id) {
        const doc = this.currentDocuments.find(d => d.id === id);
        if (!doc) {
            window.app.showToast('Documento não encontrado.', 'error');
            return;
        }

        // Simular visualização (em produção, abriria o arquivo)
        alert(`Visualizando documento: ${doc.descricao}\nTipo: ${this.getTipoDocumentoText(doc.tipo)}\nFuncionário: ${doc.funcionarioId}`);
    }

    deleteDocumento(id) {
        if (confirm('Tem certeza que deseja excluir este documento?')) {
            storageManager.deleteDocumento(id);
            this.loadDocumentos();
            window.app.showToast('Documento excluído com sucesso!', 'success');
        }
    }

    openModal() {
        const modal = document.getElementById('documentoModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('documentoForm').reset();
        }
    }

    closeModal() {
        const modal = document.getElementById('documentoModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Inicialização
window.documentosManager = new DocumentosManager();