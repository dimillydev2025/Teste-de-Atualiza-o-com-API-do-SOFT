
/* Patched dashboard helpers: manage Chart.js instances and downsampling */
if(!window._softRhCharts) window._softRhCharts = {};
const funcionariosDashboard = [
    { nome: 'João Silva', departamento: 'TI', dataAdmissao: '2026-01-15', dataNascimento: '1990-09-24', notaAvaliacao: 9 },
    { nome: 'Maria Santos', departamento: 'RH', dataAdmissao: '2026-02-10', dataNascimento: '1985-10-03', notaAvaliacao: 8 },
    { nome: 'Pedro Oliveira', departamento: 'Vendas', dataAdmissao: '2026-03-01', dataNascimento: '1992-10-11', notaAvaliacao: 7 },
    { nome: 'Ana Costa', departamento: 'Marketing', dataAdmissao: '2026-04-18', dataNascimento: '1988-11-02', notaAvaliacao: 10 },
    { nome: 'Lucas Almeida', departamento: 'Financeiro', dataAdmissao: '2026-05-06', dataNascimento: '1991-11-18', notaAvaliacao: 6 },
    { nome: 'Beatriz Lima', departamento: 'TI', dataAdmissao: '2026-06-22', dataNascimento: '1995-12-07', notaAvaliacao: 8 },
    { nome: 'Rafael Souza', departamento: 'Vendas', dataAdmissao: '2026-07-09', dataNascimento: '1989-12-19', notaAvaliacao: 5 },
    { nome: 'Carolina Rocha', departamento: 'RH', dataAdmissao: '2026-08-12', dataNascimento: '1993-01-08', notaAvaliacao: 9 }
];
function createOrUpdateChart(ctxId, config){
  try{
        const ctx = typeof ctxId === 'string' ? document.getElementById(ctxId) : ctxId;
        const chartKey = typeof ctxId === 'string' ? ctxId : ctx?.id;
    if(!ctx) return null;
        if(window._softRhCharts[chartKey]) {
            try{ window._softRhCharts[chartKey].destroy(); } catch(e){ console.warn('chart destroy error', e); }
            window._softRhCharts[chartKey] = null;
    }
    const c = new Chart(ctx, config);
        window._softRhCharts[chartKey] = c;
    return c;
  }catch(e){
    console.error('createOrUpdateChart error', e);
    return null;
  }
}
// downsample labels+data to maxPoints
function downsampleSeries(labels, data, maxPoints){
  if(labels.length <= maxPoints) return {labels, data};
  const step = Math.ceil(labels.length / maxPoints);
  const nLabels = [], nData = [];
  for(let i=0;i<labels.length;i+=step){
    nLabels.push(labels[i]);
    nData.push(data[i]);
  }
  return {labels: nLabels, data: nData};
}

/**
 * Dashboard Manager - Soft RH
 * Gerenciamento de estatísticas e gráficos do dashboard
 */

class DashboardManager {
    constructor() {
        this.charts = {};
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startAutoUpdate();
    }

    setupEventListeners() {
        // Botão de refresh
        const refreshBtn = document.querySelector('.refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateAll();
                window.app.showToast('Dashboard atualizado!', 'info');
            });
        }

        // Filtros de data do dashboard
        const dataFiltros = document.querySelectorAll('.dashboard-filter');
        dataFiltros.forEach(filtro => {
            filtro.addEventListener('change', () => {
                this.updateAll();
            });
        });
    }

    startAutoUpdate() {
        // Atualiza o dashboard a cada 5 minutos
        this.updateInterval = setInterval(() => {
            this.updateAll();
        }, 300000); // 5 minutos
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateAll() {
        this.updateEstatisticas();
        this.updateGraficos();
        this.updateRelatoriosRapidos();
    }

    updateEstatisticas() {
        const stats = storageManager.getEstatisticas();
        
        // Atualiza valores com animação
        this.animateValue('totalFuncionarios', stats.totalFuncionarios);
        this.animateValue('novosFuncionarios', stats.novosFuncionarios);
        this.animateValue('taxaSatisfacao', stats.taxaSatisfacao, '%');
        this.animateValue('custoRH', stats.custoRH, 'R$ ');
        this.animateValue('totalDocumentos', stats.totalDocumentos);
        this.animateValue('feriasPendentes', stats.feriasPendentes);
    }

    animateValue(elementId, value, prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
        const endValue = value;
        const duration = 1000; // 1 segundo
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
            
            if (elementId === 'custoRH') {
                element.textContent = prefix + currentValue.toLocaleString('pt-BR');
            } else {
                element.textContent = prefix + currentValue;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateGraficos() {
        this.updateGraficoDepartamentos();
        this.updateGraficoContratacoes();
        this.updateGraficoSatisfacao();
    }

    getFuncionariosDashboard() {
        const funcionarios = storageManager.getFuncionarios();
        const funcionariosPersistidos = funcionarios.map(funcionario => ({
            ...funcionario,
            notaAvaliacao: funcionario.notaAvaliacao || this.getNotaFuncionario(funcionario)
        }));
        const nomesPersistidos = new Set(funcionariosPersistidos.map(funcionario => funcionario.nome));
        return funcionariosDashboard
            .map(funcionario => funcionariosPersistidos.find(item => item.nome === funcionario.nome) || funcionario)
            .concat(funcionariosPersistidos.filter(funcionario => !nomesPersistidos.has(funcionario.nome)));
    }

    getNotaFuncionario(funcionario) {
        const avaliacao = storageManager.getAvaliacoes().find(item =>
            String(item.funcionarioId) === String(funcionario.id) || item.funcionarioNome === funcionario.nome
        );
        return avaliacao ? Number(avaliacao.nota) : 0;
    }

    parseDateLocal(dateValue) {
        return new Date(`${dateValue}T12:00:00`);
    }

    updateGraficoDepartamentos() {
        const ctx = document.getElementById('departamentoChart');
        if (!ctx) return;

        const funcionarios = this.getFuncionariosDashboard();
        const departamentos = {};
        
        funcionarios.forEach(f => {
            departamentos[f.departamento] = (departamentos[f.departamento] || 0) + 1;
        });

        const data = {
            labels: Object.keys(departamentos),
            datasets: [{
                data: Object.values(departamentos),
                backgroundColor: [
                    '#6a1b9a', // TI - Roxo principal
                    '#4a148c', // RH - Roxo escuro
                    '#8e24aa', // Vendas - Roxo claro
                    '#000000', // Marketing - Preto
                    '#424242'  // Financeiro - Cinza escuro
                ],
                borderWidth: 0
            }]
        };

        if (this.charts.departamento) {
            this.charts.departamento.data = data;
            this.charts.departamento.update();
        } else {
            this.charts.departamento = createOrUpdateChart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed * 100) / total).toFixed(1);
                                    return `${context.label}: ${context.parsed} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    updateGraficoContratacoes() {
        const ctx = document.getElementById('contratacoesChart');
        if (!ctx) return;

        const funcionarios = this.getFuncionariosDashboard();
        const meses = {};
        funcionarios.forEach(f => {
            const mes = new Date(f.dataAdmissao).toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric'
            });
            meses[mes] = (meses[mes] || 0) + 1;
        });

        const sortedMeses = Object.keys(meses).sort((a, b) => {
            const [mesA, anoA] = a.split(' ');
            const [mesB, anoB] = b.split(' ');
            return new Date(`${mesA} 1, ${anoA}`) - new Date(`${mesB} 1, ${anoB}`);
        });

        const data = {
            labels: sortedMeses,
            datasets: [{
                label: 'Contratações',
                data: sortedMeses.map(mes => meses[mes]),
                backgroundColor: '#6a1b9a',
                borderColor: '#4a148c',
                borderWidth: 1,
                borderRadius: 6
            }]
        };

        if (this.charts.contratacoes) {
            this.charts.contratacoes.data = data;
            this.charts.contratacoes.update();
        } else {
            this.charts.contratacoes = createOrUpdateChart(ctx, {
                type: 'bar',
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });
        }
    }

    updateGraficoSatisfacao() {
        const ctx = document.getElementById('satisfacaoChart');
        if (!ctx) return;

        const avaliacoes = this.getFuncionariosDashboard().map(funcionario => funcionario.notaAvaliacao);
        const satisfacao = {
            'Excelente (9-10)': 0,
            'Bom (7-8)': 0,
            'Regular (5-6)': 0,
            'Ruim (3-4)': 0,
            'Péssimo (0-2)': 0
        };

        avaliacoes.forEach(avaliacao => {
            const nota = Number(avaliacao) || 0;
            if (nota >= 9) satisfacao['Excelente (9-10)']++;
            else if (nota >= 7) satisfacao['Bom (7-8)']++;
            else if (nota >= 5) satisfacao['Regular (5-6)']++;
            else if (nota >= 3) satisfacao['Ruim (3-4)']++;
            else satisfacao['Péssimo (0-2)']++;
        });

        const data = {
            labels: Object.keys(satisfacao),
            datasets: [{
                label: 'Funcionários',
                data: Object.values(satisfacao),
                backgroundColor: ['#6a1b9a', '#8e24aa', '#ab47bc', '#ce93d8', '#e1bee7'],
                borderColor: '#4a148c',
                borderWidth: 1,
                borderRadius: 6
            }]
        };

        if (this.charts.satisfacao) {
            this.charts.satisfacao.data = data;
            this.charts.satisfacao.update();
        } else {
            this.charts.satisfacao = createOrUpdateChart(ctx, {
                type: 'bar',
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            });
        }
    }

    updateGraficoRotatividade() {
        const ctx = document.getElementById('rotatividadeChart');
        if (!ctx) return;
        const funcionarios = this.getFuncionariosDashboard();
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const rotatividade = new Array(12).fill(0);
        funcionarios.forEach(f => rotatividade[new Date(f.dataAdmissao).getMonth()]++);
        const data = { labels: meses, datasets: [{ label: 'Admissões', data: rotatividade, backgroundColor: '#6a1b9a' }] };
        if (this.charts.rotatividade) {
            this.charts.rotatividade.data = data;
            this.charts.rotatividade.update();
        } else {
            this.charts.rotatividade = createOrUpdateChart(ctx, { type: 'bar', data, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } } });
        }
    }
    updateGraficoSatisfacao() {
        const ctx = document.getElementById('satisfacaoChart');
        if (!ctx) return;

        const avaliacoes = this.getFuncionariosDashboard().map(funcionario => funcionario.notaAvaliacao);
        const satisfacao = {
            'Excelente (9-10)': 0,
            'Bom (7-8)': 0,
            'Regular (5-6)': 0,
            'Ruim (3-4)': 0,
            'Péssimo (1-2)': 0
        };

        avaliacoes.forEach(avaliacao => {
            const nota = Number(avaliacao) || 0;
            if (nota >= 9) satisfacao['Excelente (9-10)']++;
            else if (nota >= 7) satisfacao['Bom (7-8)']++;
            else if (nota >= 5) satisfacao['Regular (5-6)']++;
            else if (nota >= 3) satisfacao['Ruim (3-4)']++;
            else satisfacao['Péssimo (1-2)']++;
        });

        const data = {
            labels: Object.keys(satisfacao),
            datasets: [{
                data: Object.values(satisfacao),
                backgroundColor: [
                    '#6a1b9a', // Roxo principal - Excelente
                    '#8e24aa', // Roxo claro - Bom
                    '#4a148c', // Roxo escuro - Regular
                    '#000000', // Preto - Ruim
                    '#424242'  // Cinza escuro - Péssimo
                ],
                borderWidth: 0
            }]
        };

        if (this.charts.satisfacao) {
            this.charts.satisfacao.data = data;
            this.charts.satisfacao.update();
        } else {
            this.charts.satisfacao = createOrUpdateChart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    updateGraficoRotatividade() {
        const ctx = document.getElementById('rotatividadeChart');
        if (!ctx) return;

        const funcionarios = this.getFuncionariosDashboard();
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const rotatividade = new Array(12).fill(0);

        // Simula dados de rotatividade (entrada vs saída)
        funcionarios.forEach(f => {
            const mesAdmissao = new Date(f.dataAdmissao).getMonth();
            rotatividade[mesAdmissao]++;
        });

        const data = {
            labels: meses,
            datasets: [{
                label: 'Admissões',
                data: rotatividade,
                backgroundColor: '#6a1b9a',
                borderColor: '#4a148c',
                borderWidth: 1
            }, {
                label: 'Demissões',
                data: rotatividade.map(val => Math.floor(val * 0.3)), // Simula 30% de rotatividade
                backgroundColor: '#000000',
                borderColor: '#424242',
                borderWidth: 1
            }]
        };

        if (this.charts.rotatividade) {
            this.charts.rotatividade.data = data;
            this.charts.rotatividade.update();
        } else {
            this.charts.rotatividade = createOrUpdateChart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
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

    updateRelatoriosRapidos() {
        this.updateProximosAniversarios();
        this.updateProximasAvaliacoes();
        this.updateAlertasImportantes();
    }

    updateProximosAniversarios() {
        const container = document.getElementById('proximosAniversarios');
        if (!container) return;

        const funcionarios = this.getFuncionariosDashboard();
        const hoje = new Date();

        const aniversariantes = funcionarios.filter(f => {
            if (!f.dataNascimento) return false;
            const nascimento = this.parseDateLocal(f.dataNascimento);
            const esteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
            if (esteAno < hoje) esteAno.setFullYear(hoje.getFullYear() + 1);
            return true;
        }).sort((a, b) => {
            const dataA = this.parseDateLocal(a.dataNascimento);
            const dataB = this.parseDateLocal(b.dataNascimento);
            dataA.setFullYear(hoje.getFullYear());
            dataB.setFullYear(hoje.getFullYear());
            if (dataA < hoje) dataA.setFullYear(hoje.getFullYear() + 1);
            if (dataB < hoje) dataB.setFullYear(hoje.getFullYear() + 1);
            return dataA - dataB;
        });

        if (aniversariantes.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center;">Nenhum aniversário nos próximos 30 dias</p>';
            return;
        }

        container.innerHTML = aniversariantes.slice(0, 3).map(f => {
            const nascimento = this.parseDateLocal(f.dataNascimento);
            const diaMes = nascimento.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            return `
                <div class="aniversario-item">
                    <div class="aniversario-avatar">${f.nome.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
                    <div class="aniversario-info">
                        <div class="aniversario-nome">${f.nome}</div>
                        <div class="aniversario-departamento">${f.departamento || 'Departamento não informado'}</div>
                        <div class="aniversario-data">${diaMes}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateProximasAvaliacoes() {
        const container = document.getElementById('proximasAvaliacoes');
        if (!container) return;

        const avaliacoes = storageManager.getAvaliacoes();
        const hoje = new Date();
        const proximos30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

        const proximas = avaliacoes.filter(av => {
            if (!av.data) return false;
            const dataAv = new Date(av.data);
            return dataAv >= hoje && dataAv <= proximos30Dias;
        }).sort((a, b) => new Date(a.data) - new Date(b.data));

        if (proximas.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center;">Nenhuma avaliação agendada</p>';
            return;
        }

        container.innerHTML = proximas.slice(0, 5).map(av => {
            const data = new Date(av.data);
            const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            return `
                <div class="avaliacao-item">
                    <div class="avaliacao-info">
                        <div class="avaliacao-funcionario">${av.funcionarioNome || 'Funcionário'}</div>
                        <div class="avaliacao-data">${dataFormatada}</div>
                    </div>
                    <div class="avaliacao-tipo">${av.tipo || 'Avaliação'}</div>
                </div>
            `;
        }).join('');
    }

    updateAlertasImportantes() {
        const container = document.getElementById('alertasImportantes');
        if (!container) return;

        const alertas = this.gerarAlertas();
        
        if (alertas.length === 0) {
            container.innerHTML = '<p style="color: var(--gray-500); text-align: center;">Nenhum alerta importante</p>';
            return;
        }

        container.innerHTML = alertas.slice(0, 3).map(alerta => `
            <div class="alerta-item ${alerta.tipo}">
                <i class="fas fa-${alerta.icone}"></i>
                <div class="alerta-info">
                    <div class="alerta-titulo">${alerta.titulo}</div>
                    <div class="alerta-descricao">${alerta.descricao}</div>
                </div>
            </div>
        `).join('');
    }

    gerarAlertas() {
        const alertas = [];
        const funcionarios = this.getFuncionariosDashboard();
        const vagas = storageManager.getVagas();
        const avaliacoes = storageManager.getAvaliacoes();

        const hoje = new Date();
        const documentos = storageManager.getDocumentos ? storageManager.getDocumentos() : [];
        const documentosVencendo = documentos.filter(documento => {
            const validade = documento.dataValidade || documento.validade;
            if (!validade) return false;
            const data = new Date(validade);
            return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
        }).length;
        const feriasPendentes = (storageManager.getFerias ? storageManager.getFerias() : [])
            .filter(ferias => ferias.status === 'pendente').length;

        alertas.push({
            tipo: 'warning',
            icone: 'file-circle-exclamation',
            titulo: `${documentosVencendo} documentos vencendo este mês`,
            descricao: documentosVencendo ? 'Revise os documentos antes do prazo.' : 'Nenhum documento vence no período.'
        });
        alertas.push({
            tipo: 'info',
            icone: 'umbrella-beach',
            titulo: `${feriasPendentes} solicitações de férias pendentes`,
            descricao: feriasPendentes ? 'Existem solicitações aguardando aprovação.' : 'Nenhuma solicitação aguardando aprovação.'
        });

        // Alerta: Funcionários sem avaliação há mais de 6 meses
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

        funcionarios.forEach(f => {
            const ultimaAvaliacao = avaliacoes
                .filter(av => av.funcionarioId === f.id)
                .sort((a, b) => new Date(b.data) - new Date(a.data))[0];

            if (!ultimaAvaliacao || new Date(ultimaAvaliacao.data) < seisMesesAtras) {
                alertas.push({
                    tipo: 'warning',
                    icone: 'exclamation-triangle',
                    titulo: 'Avaliação Pendente',
                    descricao: `${f.nome} está sem avaliação há mais de 6 meses`
                });
            }
        });

        // Alerta: Vagas abertas há mais de 90 dias
        const noventaDiasAtras = new Date();
        noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

        vagas.forEach(vaga => {
            if (vaga.status === 'aberta' && new Date(vaga.dataCriacao) < noventaDiasAtras) {
                alertas.push({
                    tipo: 'info',
                    icone: 'info-circle',
                    titulo: 'Vaga Aberta Há Muito Tempo',
                    descricao: `${vaga.titulo} está aberta há mais de 90 dias`
                });
            }
        });

        // Alerta: Muitos funcionários de férias
        const funcionariosFerias = funcionarios.filter(f => f.status === 'ferias').length;
        if (funcionariosFerias > funcionarios.length * 0.2) {
            alertas.push({
                tipo: 'warning',
                icone: 'umbrella-beach',
                titulo: 'Muitos Funcionários de Férias',
                descricao: `${funcionariosFerias} funcionários estão de férias (${Math.round((funcionariosFerias / funcionarios.length) * 100)}%)`
            });
        }

        return alertas;
    }

    // Exportação de relatórios
    exportarDashboard() {
        const dados = {
            estatisticas: storageManager.getEstatisticas(),
            funcionarios: storageManager.getFuncionarios(),
            vagas: storageManager.getVagas(),
            avaliacoes: storageManager.getAvaliacoes(),
            dataExportacao: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-soft-rh-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        window.app.showToast('Dashboard exportado com sucesso!', 'success');
    }

    // Limpeza de recursos
    destroy() {
        this.stopAutoUpdate();
        
        // Destrói todos os gráficos
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        this.charts = {};
    }
}

// Inicialização
window.dashboardManager = new DashboardManager();