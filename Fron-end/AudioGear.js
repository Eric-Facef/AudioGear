const API_URL = "http://localhost:8080/api/componentes";
let moduloSelecionado = null;
let falanteSelecionado = null;

// 1. FUNÇÃO PARA ALTERNAR AS ABAS (SPA) - CORRIGIDA
function alternarAba(nomeAba) {
    if (window.event) window.event.preventDefault();

    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
    document.querySelectorAll('.btn-menu').forEach(btn => btn.classList.remove('ativo'));

    const botoes = document.querySelectorAll('.btn-menu');
    
    if (nomeAba === 'calculo') {
        document.getElementById('aba-calculo').classList.add('ativa');
        botoes[0].classList.add('ativo');
        carregarComponentesParaCalculo(); 
    } else if (nomeAba === 'catalogo') {
        document.getElementById('aba-catalogo').classList.add('ativa');
        botoes[1].classList.add('ativo');
        carregarCatalogoCompleto(); 
    }
}

// 2. BUSCAR DADOS DO BACK-END E PREENCHER A TELA DE CÁLCULO
async function carregarComponentesParaCalculo() {
    try {
        const response = await fetch(API_URL);
        const componentes = await response.json();

        const listaModulos = document.getElementById('lista-modulos');
        const listaFalantes = document.getElementById('lista-falantes');

        listaModulos.innerHTML = "";
        listaFalantes.innerHTML = "";

        componentes.forEach(comp => {
            const compString = JSON.stringify(comp).replace(/"/g, '&quot;');
            
            const htmlCard = `
                <div class="item-option" id="comp-${comp.id}" onclick="selecionarItem(${comp.id}, '${comp.tipo}', '${compString}')">
                    <span class="radio-circle"></span>
                    <div class="item-info">
                        <strong>${comp.marca} ${comp.nome}</strong>
                        <span class="item-details-neon">| ${comp.potenciaRms}W RMS | ${comp.impedancia} Ohms ${comp.tipo === 'AMPLIFICADOR' ? `| ${comp.canais} canais` : ''}</span>
                    </div>
                </div>
            `;

            if (comp.tipo === "AMPLIFICADOR") {
                listaModulos.innerHTML += htmlCard;
            } else if (comp.tipo === "ALTO_FALANTE") {
                listaFalantes.innerHTML += htmlCard;
            }
        });
    } catch (error) {
        console.error("Erro ao buscar componentes para o cálculo:", error);
    }
}

// 3. SELECIONAR ITEM NOS CARDS (EFEITO VISUAL E CAPTURA DE DADOS)
function selecionarItem(id, tipo, compData) {
    const compObj = JSON.parse(compData.replace(/&quot;/g, '"'));

    if (tipo === 'AMPLIFICADOR') {
        if (moduloSelecionado) document.getElementById(`comp-${moduloSelecionado.id}`)?.classList.remove('selected');
        moduloSelecionado = compObj;
    } else {
        if (falanteSelecionado) document.getElementById(`comp-${falanteSelecionado.id}`)?.classList.remove('selected');
        falanteSelecionado = compObj;
    }
    document.getElementById(`comp-${id}`).classList.add('selected');
}

// 4. EVENTO PARA FECHAR O MODAL DE ALERTA DE SELEÇÃO
document.getElementById('btn-fechar-alerta').addEventListener('click', () => {
    document.getElementById('modal-alerta').style.display = "none";
});

// 5. LÓGICA DO BOTÃO VERIFICAR CASAMENTO (REFEITO E UNIFICADO)
// ========================================================
// ⚡ 5. LÓGICA DO BOTÃO VERIFICAR CASAMENTO (FORÇANDO COR SÓLIDA)
// ========================================================
document.getElementById('btn-verificar').addEventListener('click', () => {
    // Pegamos o painel para mostrar a div, mas usamos a 'result-box' para colorir
    const painelPai = document.getElementById('resultado-panel');
    const caixaResultado = painelPai.querySelector('.result-box'); // <-- O segredo está aqui
    const resStatus = document.getElementById('res-status');
    const resDetalhes = document.getElementById('res-detalhes');

    if (!moduloSelecionado || !falanteSelecionado) {
        document.getElementById('texto-alerta-mensagem').innerText = "Por favor, selecione tanto o Módulo quanto o Alto-Falante nas listas laterais antes de rodar o teste de casamento.";
        document.getElementById('modal-alerta').style.display = "flex"; 
        return; 
    }

    painelPai.style.display = "block"; 
    const potenciaDoModuloPorCanal = moduloSelecionado.potenciaRms / moduloSelecionado.canais;

    // A lógica das cores (aplicando no caixaResultado agora)
    if (moduloSelecionado.impedancia === falanteSelecionado.impedancia) {
        caixaResultado.style.setProperty('background-color', '#a3ff00', 'important');
        resStatus.style.color = '#000000';
        resDetalhes.style.color = '#000000';
        resStatus.innerHTML = "⚡ CASAMENTO PERFEITO (IMPEDÂNCIA)";
        resDetalhes.innerHTML = `Módulo envia ${potenciaDoModuloPorCanal}W RMS por canal em ${moduloSelecionado.impedancia} Ohms. Falante suporta ${falanteSelecionado.potenciaRms}W RMS.`;
    
    } else if (moduloSelecionado.impedancia < falanteSelecionado.impedancia) {
        caixaResultado.style.setProperty('background-color', '#ffeb3b', 'important');
        resStatus.style.color = '#000000';
        resDetalhes.style.color = '#000000';
        resStatus.innerHTML = "⚠️ COMPATÍVEL COM PERDA DE RENDIMENTO";
        resDetalhes.innerHTML = `A impedância do falante (${falanteSelecionado.impedancia}Ω) é maior que a do módulo (${moduloSelecionado.impedancia}Ω).`;
    
    } else {
        caixaResultado.style.setProperty('background-color', '#f44336', 'important');
        resStatus.style.color = '#ffffff';
        resDetalhes.style.color = '#ffffff';
        resStatus.innerHTML = "❌ PERIGO: IMPEDÂNCIA INCOMPATÍVEL";
        resDetalhes.innerHTML = `A impedância do alto-falante (${falanteSelecionado.impedancia}Ω) é MENOR que a mínima do módulo (${moduloSelecionado.impedancia}Ω).`;
    }
});

// 6. BUSCAR DADOS E PREENCHER A TELA DO CATÁLOGO
async function carregarCatalogoCompleto() {
    try {
        const response = await fetch(API_URL);
        const componentes = await response.json();
        const corpoTabela = document.getElementById('corpo-tabela');
        corpoTabela.innerHTML = "";

        componentes.forEach(comp => {
            const compString = JSON.stringify(comp).replace(/"/g, '&quot;');

            corpoTabela.innerHTML += `
                <tr>
                    <td><strong>${comp.nome}</strong></td>
                    <td>${comp.marca}</td>
                    <td>${comp.tipo}</td>
                    <td>${comp.potenciaRms}W</td>
                    <td>${comp.impedancia}Ω</td>
                    <td>
                        <button class="btn-acao btn-editar" onclick="editarComponente('${compString}')">Editar</button>
                        <button class="btn-acao btn-deletar" onclick="deletarComponente(${comp.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
    }
}

// 7. CONTROLE DO MODAL DE EXCLUSÃO (DELETE)
let idComponenteParaDeletar = null;

function deletarComponente(id) {
    idComponenteParaDeletar = id; 
    document.getElementById('modal-deletar').style.display = "flex"; 
}

document.getElementById('btn-cancelar-deletar').addEventListener('click', () => {
    document.getElementById('modal-deletar').style.display = "none";
    idComponenteParaDeletar = null;
});

document.getElementById('btn-confirmar-deletar').addEventListener('click', async () => {
    if (!idComponenteParaDeletar) return;

    try {
        const response = await fetch(`${API_URL}/${idComponenteParaDeletar}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            document.getElementById('modal-deletar').style.display = "none";
            carregarCatalogoCompleto(); 
            if (typeof carregarComponentesParaCalculo === "function") {
                carregarComponentesParaCalculo(); 
            }
        } else {
            alert("Erro ao deletar no back-end.");
        }
    } catch (error) {
        console.error("Erro na requisição DELETE:", error);
    } finally {
        idComponenteParaDeletar = null;
    }
});

// 8. FORMULÁRIO DE EDIÇÃO CUSTOMIZADO (PUT)
function editarComponente(compString) {
    const comp = JSON.parse(compString.replace(/&quot;/g, '"'));

    document.getElementById('edit-id').value = comp.id;
    document.getElementById('edit-tipo').value = comp.tipo;
    document.getElementById('edit-nome').value = comp.nome;
    document.getElementById('edit-marca').value = comp.marca;
    document.getElementById('edit-potencia').value = comp.potenciaRms;
    document.getElementById('edit-impedancia').value = comp.impedancia;

    const campoCanais = document.getElementById('group-canais');
    if (comp.tipo === "AMPLIFICADOR") {
        campoCanais.style.display = "block";
        document.getElementById('edit-canais').value = comp.canais || 4;
    } else {
        campoCanais.style.display = "none";
        document.getElementById('edit-canais').value = "";
    }

    document.getElementById('modal-edicao').style.display = "flex";
}

document.getElementById('btn-cancelar-modal').addEventListener('click', () => {
    document.getElementById('modal-edicao').style.display = "none";
});

document.getElementById('btn-salvar-modal').addEventListener('click', async () => {
    const id = document.getElementById('edit-id').value;
    const tipo = document.getElementById('edit-tipo').value;

    const dadosAtualizados = {
        id: parseInt(id),
        nome: document.getElementById('edit-nome').value,
        marca: document.getElementById('edit-marca').value,
        tipo: tipo,
        potenciaRms: parseInt(document.getElementById('edit-potencia').value),
        impedancia: parseInt(document.getElementById('edit-impedancia').value),
        canais: tipo === "AMPLIFICADOR" ? parseInt(document.getElementById('edit-canais').value) : null
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (response.ok) {
            alert("Componente updated com sucesso!");
            document.getElementById('modal-edicao').style.display = "none"; 
            carregarCatalogoCompleto(); 
            if (typeof carregarComponentesParaCalculo === "function") {
                carregarComponentesParaCalculo(); 
            }
        } else {
            const txtErro = await response.text();
            alert(`Erro ao atualizar: ${txtErro}`);
        }
    } catch (error) {
        console.error("Erro na requisição PUT:", error);
    }
});

// Inicialização das listas de cálculo
carregarComponentesParaCalculo();

// Filtros de pesquisa nas listas
document.getElementById('busca-modulo').addEventListener('input', (evento) => {
    const termoPesquisa = evento.target.value.toLowerCase().trim();
    const cardsModulos = document.querySelectorAll('#lista-modulos .item-option');

    cardsModulos.forEach(card => {
        const textoCard = card.textContent.toLowerCase();
        if (textoCard.includes(termoPesquisa)) {
            card.style.display = "flex"; 
        } else {
            card.style.display = "none"; 
        }
    });
});

document.getElementById('busca-falante').addEventListener('input', (evento) => {
    const termoPesquisa = evento.target.value.toLowerCase().trim();
    const cardsFalantes = document.querySelectorAll('#lista-falantes .item-option');

    cardsFalantes.forEach(card => {
        const textoCard = card.textContent.toLowerCase();
        if (textoCard.includes(termoPesquisa)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
});