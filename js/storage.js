
/* Patched storage.js - safe init on DOMContentLoaded */
/**
 * Sistema de Armazenamento - Soft RH
 * Gerencia dados no localStorage com estrutura profissional
 */

class StorageManager {
    constructor() {
        this.dbName = 'soft_rh_db';
        this.initializeDatabase();
    }

    // Inicializa o banco de dados com estrutura padrão
    initializeDatabase() {
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                funcionarios: [],
                vagas: [],
                treinamentos: [],
                avaliacoes: [],
                documentos: [],
                ferias: [],
                configuracoes: {
                    nomeEmpresa: 'Soft RH',
                    emailContato: 'contato@softrh.com.br',
                    versao: '1.0.0',
                    dataCriacao: new Date().toISOString()
                },
                metadata: {
                    ultimaAtualizacao: new Date().toISOString(),
                    totalFuncionarios: 0,
                    totalVagas: 0,
                    totalTreinamentos: 0,
                    totalDocumentos: 0,
                    totalFerias: 0
                }
            };
            
            localStorage.setItem(this.dbName, JSON.stringify(initialData));
        }
    }

    // Obtém todos os dados
    getAllData() {
        try {
            const data = localStorage.getItem(this.dbName);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao obter dados:', error);
            return null;
        }
    }

    // Salva todos os dados
    saveAllData(data) {
        try {
            // Atualiza metadata
            data.metadata = {
                ...data.metadata,
                ultimaAtualizacao: new Date().toISOString(),
                totalFuncionarios: data.funcionarios.length,
                totalVagas: data.vagas.length,
                totalTreinamentos: data.treinamentos.length,
                totalDocumentos: data.documentos.length,
                totalFerias: data.ferias.length
            };
            
            localStorage.setItem(this.dbName, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    // Operações reutilizáveis para coleções armazenadas em arrays
    createCrud(collectionName) {
        return {
            list: () => {
                const data = this.getAllData();
                return data && Array.isArray(data[collectionName]) ? data[collectionName] : [];
            },
            read: (id) => {
                return this.createCrud(collectionName).list().find(item => String(item.id) === String(id)) || null;
            },
            create: (item) => {
                const data = this.getAllData();
                if (!data || !Array.isArray(data[collectionName])) return null;

                const now = new Date().toISOString();
                const newItem = {
                    ...item,
                    id: this.generateId(),
                    dataCriacao: now,
                    dataAtualizacao: now
                };
                data[collectionName].push(newItem);
                return this.saveAllData(data) ? newItem : null;
            },
            update: (id, changes) => {
                const data = this.getAllData();
                if (!data || !Array.isArray(data[collectionName])) return false;

                const index = data[collectionName].findIndex(item => String(item.id) === String(id));
                if (index === -1) return false;

                data[collectionName][index] = {
                    ...data[collectionName][index],
                    ...changes,
                    id: data[collectionName][index].id,
                    dataAtualizacao: new Date().toISOString()
                };
                return this.saveAllData(data);
            },
            remove: (id) => {
                const data = this.getAllData();
                if (!data || !Array.isArray(data[collectionName])) return false;

                const index = data[collectionName].findIndex(item => String(item.id) === String(id));
                if (index === -1) return false;

                data[collectionName].splice(index, 1);
                return this.saveAllData(data);
            }
        };
    }

    // CRUD para Funcionários
    getFuncionarios() {
        return this.createCrud('funcionarios').list();
    }

    addFuncionario(funcionario) {
        return this.createCrud('funcionarios').create(funcionario);
    }

    updateFuncionario(id, funcionarioAtualizado) {
        return this.createCrud('funcionarios').update(id, funcionarioAtualizado);
    }

    deleteFuncionario(id) {
        return this.createCrud('funcionarios').remove(id);
    }

    getFuncionarioById(id) {
        return this.createCrud('funcionarios').read(id);
    }

    // CRUD para Vagas
    getVagas() {
        const data = this.getAllData();
        return data ? data.vagas : [];
    }

    addVaga(vaga) {
        const data = this.getAllData();
        if (!data) return null;

        const novaVaga = {
            id: this.generateId(),
            ...vaga,
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString(),
            status: 'aberta'
        };

        data.vagas.push(novaVaga);
        
        if (this.saveAllData(data)) {
            return novaVaga;
        }
        
        return null;
    }

    updateVaga(id, vagaAtualizada) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.vagas.findIndex(v => v.id === id);
        if (index === -1) return false;

        data.vagas[index] = {
            ...data.vagas[index],
            ...vagaAtualizada,
            dataAtualizacao: new Date().toISOString()
        };

        return this.saveAllData(data);
    }

    deleteVaga(id) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.vagas.findIndex(v => v.id === id);
        if (index === -1) return false;

        data.vagas.splice(index, 1);
        return this.saveAllData(data);
    }

    // CRUD para Treinamentos
    getTreinamentos() {
        const data = this.getAllData();
        return data ? data.treinamentos : [];
    }

    addTreinamento(treinamento) {
        const data = this.getAllData();
        if (!data) return null;

        const novoTreinamento = {
            id: this.generateId(),
            ...treinamento,
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString(),
            participantes: []
        };

        data.treinamentos.push(novoTreinamento);
        
        if (this.saveAllData(data)) {
            return novoTreinamento;
        }
        
        return null;
    }

    updateTreinamento(id, treinamentoAtualizado) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.treinamentos.findIndex(t => t.id === id);
        if (index === -1) return false;

        data.treinamentos[index] = {
            ...data.treinamentos[index],
            ...treinamentoAtualizado,
            dataAtualizacao: new Date().toISOString()
        };

        return this.saveAllData(data);
    }

    deleteTreinamento(id) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.treinamentos.findIndex(t => t.id === id);
        if (index === -1) return false;

        data.treinamentos.splice(index, 1);
        return this.saveAllData(data);
    }

    // CRUD para Avaliações
    getAvaliacoes() {
        const data = this.getAllData();
        return data ? data.avaliacoes : [];
    }

    addAvaliacao(avaliacao) {
        const data = this.getAllData();
        if (!data) return null;

        const novaAvaliacao = {
            id: this.generateId(),
            ...avaliacao,
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        data.avaliacoes.push(novaAvaliacao);
        
        if (this.saveAllData(data)) {
            return novaAvaliacao;
        }
        
        return null;
    }

    updateAvaliacao(id, avaliacaoAtualizada) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.avaliacoes.findIndex(avaliacao => String(avaliacao.id) === String(id));
        if (index === -1) return false;

        data.avaliacoes[index] = {
            ...data.avaliacoes[index],
            ...avaliacaoAtualizada,
            id: data.avaliacoes[index].id,
            dataAtualizacao: new Date().toISOString()
        };
        return this.saveAllData(data);
    }

    deleteAvaliacao(id) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.avaliacoes.findIndex(avaliacao => String(avaliacao.id) === String(id));
        if (index === -1) return false;

        data.avaliacoes.splice(index, 1);
        return this.saveAllData(data);
    }

    // Configurações
    getConfiguracoes() {
        const data = this.getAllData();
        return data ? data.configuracoes : {};
    }

    updateConfiguracoes(configuracoes) {
        const data = this.getAllData();
        if (!data) return false;

        data.configuracoes = {
            ...data.configuracoes,
            ...configuracoes,
            dataAtualizacao: new Date().toISOString()
        };

        return this.saveAllData(data);
    }

    // Métodos auxiliares
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Busca e filtros
    searchFuncionarios(termo) {
        const funcionarios = this.getFuncionarios();
        if (!termo) return funcionarios;

        const termoLower = termo.toLowerCase();
        return funcionarios.filter(f => 
            f.nome.toLowerCase().includes(termoLower) ||
            f.email.toLowerCase().includes(termoLower) ||
            f.cargo.toLowerCase().includes(termoLower) ||
            f.departamento.toLowerCase().includes(termoLower)
        );
    }

    filterFuncionarios(filtros) {
        let funcionarios = this.getFuncionarios();

        if (filtros.departamento) {
            funcionarios = funcionarios.filter(f => f.departamento === filtros.departamento);
        }

        if (filtros.status) {
            funcionarios = funcionarios.filter(f => f.status === filtros.status);
        }

        if (filtros.dataInicio && filtros.dataFim) {
            funcionarios = funcionarios.filter(f => {
                const dataAdmissao = new Date(f.dataAdmissao);
                const dataInicio = new Date(filtros.dataInicio);
                const dataFim = new Date(filtros.dataFim);
                return dataAdmissao >= dataInicio && dataAdmissao <= dataFim;
            });
        }

        return funcionarios;
    }

    // Estatísticas
    getEstatisticas() {
        const funcionarios = this.getFuncionarios();
        const vagas = this.getVagas();
        const treinamentos = this.getTreinamentos();
        const documentos = this.getDocumentos();
        const ferias = this.getFerias();

        const stats = {
            totalFuncionarios: funcionarios.length,
            novosFuncionarios: funcionarios.filter(f => {
                const dataAdmissao = new Date(f.dataAdmissao);
                const trintaDiasAtras = new Date();
                trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
                return dataAdmissao >= trintaDiasAtras;
            }).length,
            taxaSatisfacao: 0,
            custoRH: 0,
            totalDocumentos: documentos.length,
            documentosVencendo: documentos.filter(doc => {
                if (!doc.dataValidade) return false;
                const dataValidade = new Date(doc.dataValidade);
                const trintaDiasAgora = new Date();
                trintaDiasAgora.setDate(trintaDiasAgora.getDate() + 30);
                return dataValidade <= trintaDiasAgora && dataValidade >= new Date();
            }).length,
            feriasPendentes: ferias.filter(f => f.status === 'pendente').length,
            funcionariosFerias: funcionarios.filter(f => f.status === 'ferias').length
        };

        // Calcula custo médio mensal
        const salarios = funcionarios
            .filter(f => f.salario && f.status === 'ativo')
            .map(f => parseFloat(f.salario) || 0);
        
        stats.custoRH = salarios.reduce((sum, salario) => sum + salario, 0);

        // Calcula taxa de satisfação baseada em avaliações
        const avaliacoes = this.getAvaliacoes();
        if (avaliacoes.length > 0) {
            const mediaNotas = avaliacoes.reduce((sum, av) => sum + (av.nota || 0), 0) / avaliacoes.length;
            stats.taxaSatisfacao = Math.round((mediaNotas / 10) * 100);
        }

        return stats;
    }

    // CRUD para Documentos
    getDocumentos() {
        const data = this.getAllData();
        return data ? data.documentos : [];
    }

    addDocumento(documento) {
        const data = this.getAllData();
        if (!data) return null;

        const novoDocumento = {
            id: this.generateId(),
            ...documento,
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        data.documentos.push(novoDocumento);
        
        if (this.saveAllData(data)) {
            return novoDocumento;
        }
        
        return null;
    }

    updateDocumento(id, documentoAtualizado) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.documentos.findIndex(d => d.id === id);
        if (index === -1) return false;

        data.documentos[index] = {
            ...data.documentos[index],
            ...documentoAtualizado,
            dataAtualizacao: new Date().toISOString()
        };

        return this.saveAllData(data);
    }

    deleteDocumento(id) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.documentos.findIndex(d => d.id === id);
        if (index === -1) return false;

        data.documentos.splice(index, 1);
        return this.saveAllData(data);
    }

    // CRUD para Férias
    getFerias() {
        const data = this.getAllData();
        return data ? data.ferias : [];
    }

    addFerias(ferias) {
        const data = this.getAllData();
        if (!data) return null;

        const novaFerias = {
            id: this.generateId(),
            ...ferias,
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        data.ferias.push(novaFerias);
        
        if (this.saveAllData(data)) {
            return novaFerias;
        }
        
        return null;
    }

    updateFerias(id, feriasAtualizado) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.ferias.findIndex(f => f.id === id);
        if (index === -1) return false;

        data.ferias[index] = {
            ...data.ferias[index],
            ...feriasAtualizado,
            dataAtualizacao: new Date().toISOString()
        };

        return this.saveAllData(data);
    }

    deleteFerias(id) {
        const data = this.getAllData();
        if (!data) return false;

        const index = data.ferias.findIndex(f => f.id === id);
        if (index === -1) return false;

        data.ferias.splice(index, 1);
        return this.saveAllData(data);
    }

    // Exportar dados
    exportarDados() {
        const data = this.getAllData();
        if (!data) return null;

        const dataExport = {
            ...data,
            dataExportacao: new Date().toISOString(),
            versao: '1.0.0'
        };

        return JSON.stringify(dataExport, null, 2);
    }

    // Importar dados
    importarDados(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Valida estrutura básica
            if (!data.funcionarios || !data.vagas || !data.treinamentos) {
                return false;
            }

            // Atualiza com dados importados
            const currentData = this.getAllData();
            const mergedData = {
                ...currentData,
                ...data,
                metadata: {
                    ...currentData.metadata,
                    ultimaAtualizacao: new Date().toISOString()
                }
            };

            return this.saveAllData(mergedData);
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }

    // Limpar todos os dados
    limparDados() {
        localStorage.removeItem(this.dbName);
        this.initializeDatabase();
    }
}

// Instância global
const storageManager = window._softRH_storage_manager = new StorageManager();