//const API_URL = "https://audiogear.onrender.com/api/componentes"; // PROD
//const API_AUTH_URL = "https://audiogear.onrender.com/auth"; // PROD

const API_URL = "http://localhost:8080/api/componentes"; // LOCAL
const API_AUTH_URL = "http://localhost:8080/auth"; // LOCAL

//const API_URL = "https://localhost.run/docs/forever-free/"; // LOCALHOST 
//const API_AUTH_URL = "https://770310c2d9f11a.lhr.life"; // LOCALHOST

let moduloSelecionado = null;
let falanteSelecionado = null;

// Inicialização segura da página
document.addEventListener("DOMContentLoaded", () => {
    carregarComponentesParaCalculo();
    carregarCatalogoCompleto();
    verificarEstadoLogin();
});

// 1. FUNÇÃO PARA ALTERNAR AS ABAS (SPA) - ATUALIZADA PARA 3 ABAS
function alternarAba(nomeAba) {
    if (window.event) window.event.preventDefault();

    // Oculta todos os blocos de conteúdo e remove seleções dos botões
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
    } else if (nomeAba === 'painel-admin') {
        carregarUsuarios();
        carregarStats();
        document.getElementById('aba-painel-admin').classList.add('ativa');
        if(botoes[2]) botoes[2].classList.add('ativo');
    }
}

// 2. BUSCAR DADOS DO BACK-END E PREENCHER A TELA DE CÁLCULO
function carregarComponentesParaCalculo() {
    fetch(API_URL)
        .then(res => res.json())
        .then(dados => {
            const listaModulos = document.getElementById("lista-modulos");
            const listaFalantes = document.getElementById("lista-falantes");

            if(listaModulos) listaModulos.innerHTML = "";
            if(listaFalantes) listaFalantes.innerHTML = "";

            dados.forEach(comp => {
                const item = document.createElement("div");
                item.className = "list-item";
                item.dataset.id = comp.id;
                
                if (comp.tipo === "AMPLIFICADOR") {
                    item.innerHTML = `<strong>${comp.nome}</strong> - ${comp.marca}<br>
                                      <small>${comp.potenciaRms || comp.potencia}W RMS | ${comp.impedancia}Ω | ${comp.canais} Canais</small>`;
                    item.onclick = () => selecionarModulo(comp, item);
                    if(listaModulos) listaModulos.appendChild(item);
                } else {
                    item.innerHTML = `<strong>${comp.nome}</strong> - ${comp.marca}<br>
                                      <small>${comp.potenciaRms || comp.potencia}W RMS | ${comp.impedancia}Ω</small>`;
                    item.onclick = () => selecionarFalante(comp, item);
                    if(listaFalantes) listaFalantes.appendChild(item);
                }
            });

            configurarFiltrosBusca();
        })
        .catch(err => console.error("Erro ao carregar dados de cálculo:", err));
}

// Configuração de busca em tempo real
function configurarFiltrosBusca() {
    const buscaMod = document.getElementById("busca-modulo");
    const buscaFal = document.getElementById("busca-falante");

    if(buscaMod) {
        buscaMod.oninput = function() { filtrarLista("lista-modulos", this.value); };
    }
    if(buscaFal) {
        buscaFal.oninput = function() { filtrarLista("lista-falantes", this.value); };
    }
}

function filtrarLista(idLista, texto) {
    const lista = document.getElementById(idLista);
    if(!lista) return;
    const itens = lista.getElementsByClassName("list-item");
    const busca = texto.toLowerCase();
    for (let item of itens) {
        item.style.display = item.innerText.toLowerCase().includes(busca) ? "block" : "none";
    }
}

function selecionarModulo(comp, elemento) {
    document.querySelectorAll("#lista-modulos .list-item").forEach(i => i.classList.remove("selected"));
    elemento.classList.add("selected");
    moduloSelecionado = comp;
}

function selecionarFalante(comp, elemento) {
    document.querySelectorAll("#lista-falantes .list-item").forEach(i => i.classList.remove("selected"));
    elemento.classList.add("selected");
    falanteSelecionado = comp;
}

// LÓGICA DO BOTÃO VERIFICAR CASAMENTO DE SOM
// ==========================================================================
// 🎛️ LÓGICA DO BOTÃO VERIFICAR CASAMENTO DE SOM (FUNÇÃO COMPLETA CORRIGIDA)
// ==========================================================================
const btnVerificar = document.getElementById('btn-verificar');

if (btnVerificar) {
    btnVerificar.onclick = function() {
        const modal = document.getElementById('modal-resultado-card');
        const titulo = document.getElementById('modal-resultado-titulo');
        const icone = document.getElementById('modal-resultado-icone');
        const corpo = document.getElementById('modal-resultado-mensagem');
        const overlay = document.getElementById('modal-resultado-setup');

        // Reseta as classes de estado anteriores para evitar acumulação de estilos
        if (modal) {
            modal.className = "modal-setup-card";
        }

        // ==========================================================================
        // 1. VALIDAÇÃO DE SISTEMA INCOMPLETO (Sem Módulo, Alto-Falante ou Ambos)
        // ==========================================================================
        if (!moduloSelecionado || !falanteSelecionado) {
            let mensagemErro = "";

            if (!moduloSelecionado && !falanteSelecionado) {
                mensagemErro = "Selecione os dois componentes para o cálculo. Por favor, certifique-se de escolher um <strong>Módulo</strong> e um <strong>Alto-Falante</strong> nas listas.";
            } else if (!moduloSelecionado) {
                mensagemErro = "Você selecionou o alto-falante, mas ainda falta escolher um <strong>Módulo Amplificador</strong> para realizar o cálculo.";
            } else if (!falanteSelecionado) {
                mensagemErro = "Você selecionou o módulo, mas ainda falta escolher um <strong>Alto-Falante</strong> para realizar o cálculo.";
            }

            // Define o modal para o estado de Alerta/Atenção (Borda Amarela)
            if (modal) modal.classList.add('estado-amarelo');
            if (icone) icone.innerText = "⚠️";
            if (titulo) titulo.innerText = "SISTEMA INCOMPLETO";
            if (corpo) corpo.innerHTML = mensagemErro;

            // Abre o modal estilizado
            if (overlay) overlay.style.display = 'flex';
            return; // Bloqueia a execução para não rodar cálculos com dados nulos
        }

        // ==========================================================================
        // 2. EXTRAÇÃO DE DADOS DOS COMPONENTES E CAPTURA DE INPUTS
        // ==========================================================================
        const qtdFalantes = parseInt(document.getElementById('qtd-falantes').value) || 1;
        const tipoLigacao = document.getElementById('tipo-ligacao').value;

        const impedanciaModulo = parseFloat(moduloSelecionado.impedancia);
        const potenciaModulo = parseFloat(moduloSelecionado.potenciaRms || moduloSelecionado.potencia);
        
        const impedanciaFalante = parseFloat(falanteSelecionado.impedancia);
        const potenciaFalante = parseFloat(falanteSelecionado.potenciaRms || falanteSelecionado.potencia);

        // ==========================================================================
        // 3. CÁLCULOS DE ENGENHARIA DE SOM (Associação de Impedância e Potência Total)
        // ==========================================================================
        let impedanciaFinal = 0;
        let potenciaTotalFalantes = potenciaFalante * qtdFalantes;

        if (tipoLigacao === 'paralelo') {
            // Fórmula do paralelo: Impedância de 1 falante dividida pela quantidade
            impedanciaFinal = impedanciaFalante / qtdFalantes;
        } else if (tipoLigacao === 'serie') {
            // Fórmula do série: Impedância de 1 falante multiplicada pela quantidade
            impedanciaFinal = impedanciaFalante * qtdFalantes;
        }

        // Teste de mesa preventivo no Console (F12)
        console.log("--- TESTE DE MESA ---");
        console.log(`Módulo: ${potenciaModulo}W | ${impedanciaModulo} Ohms`);
        console.log(`Falantes Totais: ${potenciaTotalFalantes}W | Final: ${impedanciaFinal} Ohms (${tipoLigacao})`);

        // ==========================================================================
        // 4. PROCESSAMENTO DOS RESULTADOS E APLICAÇÃO DOS ESTADOS VISUAIS
        // ==========================================================================

        // CASO A: PERIGO CRÍTICO (Borda Vermelha) -> Impedância abaixo do suportado pelo módulo
        if (impedanciaFinal < impedanciaModulo) {
            if (modal) modal.classList.add('estado-vermelho');
            if (icone) icone.innerText = "🚨";
            if (titulo) titulo.innerText = "PERIGO DE QUEIMA!";
            if (corpo) {
                corpo.innerHTML = `A impedância final dos alto-falantes (<strong>${impedanciaFinal.toFixed(1)} Ohms</strong>) está <strong>abaixo</strong> da impedância mínima do módulo (<strong>${impedanciaModulo} Ohms</strong>).<br><br><span style="color: var(--neon-red); font-weight: bold;">Isso gerará superaquecimento imediato e danificará o amplificador!</span>`;
            }
        }
        // CASO B: ALERTA DE EXCESSO DE POTÊNCIA (Borda Vermelha) -> Módulo forte demais para o falante
        else if (potenciaModulo > (potenciaTotalFalantes * 1.5)) {
            if (modal) modal.classList.add('estado-vermelho');
            if (icone) icone.innerText = "⚠️";
            if (titulo) titulo.innerText = "POTÊNCIA EM EXCESSO";
            if (corpo) {
                corpo.innerHTML = `O módulo possui <strong>${potenciaModulo}W RMS</strong>, ultrapassando perigosamente o limite suportado pelos alto-falantes (<strong>${potenciaTotalFalantes}W RMS</strong> no total).<br><br><span style="color: var(--neon-red);">Cuidado com a regulagem do ganho para não queimar as bobinas por clipping ou excesso de curso!</span>`;
            }
        }
        // CASO C: SISTEMA SUBAPROVEITADO (Borda Amarela) -> Impedância acima do mínimo do módulo (Rendimento parcial)
        else if (impedanciaFinal > impedanciaModulo) {
            if (modal) modal.classList.add('estado-amarelo');
            if (icone) icone.innerText = "🟡";
            if (titulo) titulo.innerText = "SISTEMA SUBAPROVEITADO";
            if (corpo) {
                // Cálculo aproximado da perda: dobra de impedância cai a potência pela metade
                const potenciaAproximada = potenciaModulo * (impedanciaModulo / impedanciaFinal);
                corpo.innerHTML = `O sistema vai tocar com segurança, mas a impedância final (<strong>${impedanciaFinal.toFixed(1)} Ohms</strong>) é maior que a saída mínima do módulo (<strong>${impedanciaModulo} Ohms</strong>).<br><br>O amplificador perderá rendimento, enviando apenas cerca de <strong>${potenciaAproximada.toFixed(0)}W RMS</strong> para os alto-falantes de <strong>${potenciaTotalFalantes}W RMS</strong>.`;
            }
        }
        // CASO D: CASAMENTO PERFEITO (Borda Verde) -> Tudo equivalente e alinhado
        else {
            if (modal) modal.classList.add('estado-verde');
            if (icone) icone.innerText = "🟢";
            if (titulo) titulo.innerText = "CASAMENTO PERFEITO!";
            if (corpo) {
                corpo.innerHTML = `Configuração ideal!<br>A impedância casou perfeitamente em <strong>${impedanciaFinal.toFixed(1)} Ohms</strong>. O módulo de <strong>${potenciaModulo}W RMS</strong> vai extrair 100% de rendimento e empurrar os alto-falantes de <strong>${potenciaTotalFalantes}W RMS</strong> com máxima segurança e fidelidade.`;
            }
        }

        // ==========================================================================
        // 5. EXIBIÇÃO DO MODAL DE DIAGNÓSTICO
        // ==========================================================================
        if (overlay) {
            overlay.style.display = 'flex';
        }
    };
}
window.fecharModalResultado = function() {
    const modalOverlay = document.getElementById("modal-resultado-setup");
    if (modalOverlay) {
        modalOverlay.style.display = "none";
    }
};

// 3. CARREGAR E EXIBIR A TABELA DE PRODUTOS COMPLETA
// FUNÇÃO PARA BUSCAR E RENDERIZAR
function carregarCatalogoCompleto() {
    fetch(API_URL)
        .then(res => res.json())
        .then(dados => {
            produtosCarregados = dados;
            renderizarTabelaCatalogo();
        })
        .catch(err => console.error("Erro ao carregar:", err));
}

function renderizarTabelaCatalogo() {
    const corpoTabela = document.getElementById("tabela-corpo-produtos");
    if (!corpoTabela) return; 

    // Pega o termo digitado na barra de busca
    const buscaInput = document.getElementById("busca-catalogo");
    const termoBusca = buscaInput ? buscaInput.value.toLowerCase() : "";

    corpoTabela.innerHTML = "";

    const dadosFiltrados = produtosCarregados.filter(prod => {
        const matchesTipo = (filtroTipoAtual === 'TODOS') || (prod.tipo === filtroTipoAtual);
        const matchesBusca = prod.nome.toLowerCase().includes(termoBusca) || prod.marca.toLowerCase().includes(termoBusca);
        return matchesTipo && matchesBusca;
    });

    dadosFiltrados.sort((a, b) => a.tipo.localeCompare(b.tipo));

    dadosFiltrados.forEach(prod => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${prod.nome}</td>
            <td>${prod.marca}</td>
            <td><span class="badge">${prod.tipo}</span></td>
            <td>${prod.potenciaRms || prod.potencia}W</td>
            <td>${prod.impedancia}Ω</td>
            <td class="btn-admin-acao">
                <button onclick='abrirModalEdicao(${JSON.stringify(prod)})'>Editar</button>
                <button onclick="abrirModalDelecao(${prod.id}, '${prod.nome}')">Excluir</button>
            </td>`;
        corpoTabela.appendChild(tr);
    });
}

// Conectar o input à busca em tempo real
document.addEventListener("DOMContentLoaded", () => {
    const buscaCat = document.getElementById("busca-catalogo");
    if (buscaCat) {
        buscaCat.addEventListener("input", renderizarTabelaCatalogo);
    }
});

// NOVA FUNÇÃO: Renderiza a tabela aplicando Filtro e Busca
function renderizarTabelaCatalogo() {
    const corpoTabela = document.getElementById("tabela-corpo-produtos");
    if (!corpoTabela) return;
    
    corpoTabela.innerHTML = "";
    
    const termoBusca = document.getElementById("busca-catalogo") ? document.getElementById("busca-catalogo").value.toLowerCase() : "";

    // Filtra pelos botões (TODOS, AMPLIFICADOR, ALTO_FALANTE) e pela busca
    const dadosFiltrados = produtosCarregados.filter(prod => {
        const matchesTipo = (filtroTipoAtual === 'TODOS') || (prod.tipo === filtroTipoAtual);
        const matchesBusca = prod.nome.toLowerCase().includes(termoBusca) || prod.marca.toLowerCase().includes(termoBusca);
        return matchesTipo && matchesBusca;
    });

    dadosFiltrados.sort((a, b) => a.tipo.localeCompare(b.tipo));

    dadosFiltrados.forEach(prod => {
        const tr = document.createElement("tr");
        const pot = prod.potenciaRms || prod.potencia;
        const infoExtra = prod.tipo === "AMPLIFICADOR" ? ` (${prod.canais} Ch)` : "";
        const classeBadge = prod.tipo === "AMPLIFICADOR" ? "badge-modulo" : "badge-falante";

        tr.innerHTML = `
            <td>${prod.nome}</td>
            <td>${prod.marca}</td>
            <td><span class="badge ${classeBadge}">${prod.tipo}</span></td>
            <td>${pot}W RMS</td>
            <td>${prod.impedancia}Ω${infoExtra}</td>
            <td class="btn-admin-acao">
                <button class="btn-tabela btn-editar" onclick='abrirModalEdicao(${JSON.stringify(prod)})'>Editar</button>
                <button class="btn-tabela btn-excluir" onclick="abrirModalDelecao(${prod.id}, '${prod.nome}')">Excluir</button>
            </td>
        `;
        corpoTabela.appendChild(tr);
    });
    
    verificarEstadoLogin();
}

// NOVA FUNÇÃO: Controla o clique nos botões de filtro
function filtrarTipoCatalogo(tipo) {
    filtroTipoAtual = tipo;
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
    
    if (tipo === 'TODOS') document.getElementById('filtro-todos').classList.add('ativo');
    if (tipo === 'AMPLIFICADOR') document.getElementById('filtro-modulo').classList.add('ativo');
    if (tipo === 'ALTO_FALANTE') document.getElementById('filtro-falante').classList.add('ativo');

    renderizarTabelaCatalogo();
}

// 4. SISTEMA DE SEGURANÇA E GERENCIAMENTO DE ESTADO DE LOGIN
function verificarEstadoLogin() {
    const token = sessionStorage.getItem('token');
    const botoesAdmin = document.querySelectorAll('.btn-admin-acao');
    const btnTopo = document.getElementById('btn-usuario-topo');
    const labelTopo = document.getElementById('label-usuario-topo');

    if (token) {
        botoesAdmin.forEach(el => el.style.display = (el.tagName === 'TR' || el.tagName === 'TD') ? 'table-cell' : 'flex');
        const botaoCad = document.getElementById('btn-abrir-cadastro');
        if (botaoCad) botaoCad.style.display = 'inline-block';
        
        if (btnTopo) btnTopo.classList.add('logado');
        if (labelTopo) labelTopo.innerText = "Painel Admin";
    } else {
        botoesAdmin.forEach(el => el.style.display = 'none');
        const botaoCad = document.getElementById('btn-abrir-cadastro');
        if (botaoCad) botaoCad.style.display = 'none';
        
        if (btnTopo) btnTopo.classList.remove('logado');
        if (labelTopo) labelTopo.innerText = "Login Admin";
        
        const abaAdmin = document.getElementById('aba-painel-admin');
        if (abaAdmin && abaAdmin.classList.contains('ativa')) {
            alternarAba('calculo');
        }
    }
}

function redirecionarOuDeslogar() {
    const token = sessionStorage.getItem('token');
    if (token) {
        alternarAba('painel-admin');
    } else {
        window.location.href = 'AudioLogin.html';
    }
}

function executarLogout() {
    const modalLogout = document.getElementById('modal-logout-alerta');
    if (modalLogout) {
        modalLogout.style.display = "flex";
        setTimeout(() => {
            sessionStorage.removeItem('token');
            window.location.reload();
        }, 1500);
    } else {
        sessionStorage.removeItem('token');
        window.location.reload();
    }
}

// ==========================================================================
// 📦 FUNÇÕES DE CONTROLE DO MODAL DE CADASTRO (REINJETADAS)
// ==========================================================================
function abrirModalCadastro() {
    const modal = document.getElementById('modal-cadastro-equipamento');
    if (modal) modal.style.display = 'flex';
}

function fecharModalCadastro() {
    const modal = document.getElementById('modal-cadastro-equipamento');
    if (modal) modal.style.display = 'none';
    
    if(document.getElementById('cad-nome')) document.getElementById('cad-nome').value = '';
    if(document.getElementById('cad-marca')) document.getElementById('cad-marca').value = '';
    if(document.getElementById('cad-potencia')) document.getElementById('cad-potencia').value = '';
    if(document.getElementById('cad-impedancia')) document.getElementById('cad-impedancia').value = '';
    if(document.getElementById('cad-canais')) document.getElementById('cad-canais').value = '';
}

function alternarCanaisModalCadastro() {
    const tipo = document.getElementById('cad-tipo').value;
    const grupoCanais = document.getElementById('cad-group-canais');
    if (grupoCanais) {
        grupoCanais.style.display = (tipo === 'AMPLIFICADOR') ? 'flex' : 'none';
    }
}

// 5. OPERAÇÃO DE SALVAR COMPONENTE (MÉTODO POST COM LIMPEZA DE TOKEN)
async function executarCadastroPeloModal(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    let tokenRaw = sessionStorage.getItem('token') || sessionStorage.getItem('token_jwt') || sessionStorage.getItem('JWT');
    if (!tokenRaw) {
        alert("Acesso negado! Por favor, faça login novamente.");
        return;
    }

    // REMOVE ASPAS EXTRAS DO TOKEN CASO EXISTAM PARA BANIR O ERRO 403
    const token = tokenRaw.replace(/['"]+/g, '').trim();

    const tipo = document.getElementById('cad-tipo').value;
    const nome = document.getElementById('cad-nome').value;
    const marca = document.getElementById('cad-marca').value;
    const potenciaRaw = document.getElementById('cad-potencia').value;
    const impedanciaRaw = document.getElementById('cad-impedancia').value;
    const canaisRaw = document.getElementById('cad-canais').value;

    if (!nome || !marca || !potenciaRaw || !impedanciaRaw) {
        alert("Por favor, preencha todos os campos obrigatórios!");
        return;
    }

    const dados = {
        nome: nome,
        marca: marca,
        tipo: tipo,
        potencia: parseInt(potenciaRaw),
        potenciaRms: parseInt(potenciaRaw), 
        impedancia: parseInt(impedanciaRaw),
        canais: tipo === "AMPLIFICADOR" && canaisRaw ? parseInt(canaisRaw) : null
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            fecharModalCadastro();
            carregarCatalogoCompleto();
            carregarComponentesParaCalculo();
            document.getElementById('modal-componente-cadastrado-msg').innerHTML =
                `O componente <strong>${nome}</strong> foi adicionado ao catálogo com sucesso!`;
            document.getElementById('modal-componente-cadastrado').style.display = 'flex';
        } else {
            const erroTexto = await response.text();
            if (response.status === 409 || (erroTexto && erroTexto.toLowerCase().includes('já'))) {
                document.getElementById('modal-componente-em-uso-msg').innerHTML =
                    `O componente <strong>${nome}</strong> já está cadastrado no sistema.`;
                document.getElementById('modal-componente-em-uso').style.display = 'flex';
            } else {
                alert(`Erro do Servidor (${response.status}): ${erroTexto || 'Falta de permissão.'}`);
            }
        }
    } catch (error) {
        console.error("Erro na requisição de cadastro:", error);
        alert("Não foi possível conectar ao servidor.");
    }
}

// SISTEMA DOS MODAIS DE EDIÇÃO E EXCLUSÃO EXISTENTES
function abrirModalEdicao(prod) {
    document.getElementById("modal-edicao").style.display = "flex";
    document.getElementById("edit-id").value = prod.id;
    document.getElementById("edit-tipo").value = prod.tipo;
    document.getElementById("edit-nome").value = prod.nome;
    document.getElementById("edit-marca").value = prod.marca;
    document.getElementById("edit-potencia").value = prod.potenciaRms || prod.potencia;
    document.getElementById("edit-impedancia").value = prod.impedancia;

    const grupoCanais = document.getElementById("edit-group-canais");
    if (prod.tipo === "AMPLIFICADOR") {
        if(grupoCanais) grupoCanais.style.display = "block";
        document.getElementById("edit-canais").value = prod.canais || "";
    } else {
        if(grupoCanais) grupoCanais.style.display = "none";
        document.getElementById("edit-canais").value = "";
    }
}

function fecharModal() {
    document.getElementById("modal-edicao").style.display = "none";
}

function salvarAlteracoes() {
    let tokenRaw = sessionStorage.getItem('token') || sessionStorage.getItem('token_jwt') || sessionStorage.getItem('JWT');
    const token = tokenRaw ? tokenRaw.replace(/['"]+/g, '').trim() : '';
    
    const id = document.getElementById("edit-id").value;
    const tipo = document.getElementById("edit-tipo").value;

    const dadosAtualizados = {
        id: parseInt(id),
        nome: document.getElementById("edit-nome").value,
        marca: document.getElementById("edit-marca").value,
        tipo: tipo,
        potencia: parseInt(document.getElementById("edit-potencia").value),
        potenciaRms: parseInt(document.getElementById("edit-potencia").value),
        impedancia: parseInt(document.getElementById("edit-impedancia").value),
        canais: tipo === "AMPLIFICADOR" ? parseInt(document.getElementById("edit-canais").value) : null
    };

    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(dadosAtualizados)
    })
    .then(res => {
        if(res.ok) {
            fecharModal();
            carregarCatalogoCompleto();
            carregarComponentesParaCalculo();
        } else {
            alert("Erro ao salvar alterações.");
        }
    });
}

function abrirModalDelecao(id, nome) {
    document.getElementById("modal-delecao").style.display = "flex";
    document.getElementById("delete-id").value = id;
    document.getElementById("delete-nome-info").innerText = nome;
}

function fecharModalDelecao() {
    document.getElementById("modal-delecao").style.display = "none";
}

function confirmarExclusaoNoBanco() {
    let tokenRaw = sessionStorage.getItem('token') || sessionStorage.getItem('token_jwt') || sessionStorage.getItem('JWT');
    const token = tokenRaw ? tokenRaw.replace(/['"]+/g, '').trim() : '';
    const id = document.getElementById("delete-id").value;

    fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        if(res.ok) {
            fecharModalDelecao();
            carregarCatalogoCompleto();
            carregarComponentesParaCalculo();
        } else {
            alert("Não foi possível deletar o item.");
        }
    });
}



// VARIÁVEIS GLOBAIS DE CONTROLE DO CATÁLOGO
let produtosCarregados = []; // Guarda a lista vinda do banco para aplicar os filtros
let filtroTipoAtual = 'TODOS'; // Guarda o tipo selecionado (TODOS, AMPLIFICADOR, ALTO_FALANTE)

// 3. CARREGAR E EXIBIR A TABELA DE PRODUTOS COMPLETA (ATUALIZADA)
function carregarCatalogoCompleto() {
    fetch(API_URL)
        .then(res => res.json())
        .then(dados => {
            // Guarda os dados na nossa variável global
            produtosCarregados = dados;
            
            // Renderiza a tabela aplicando os filtros atuais
            renderizarTabelaCatalogo();
            
            // Configura a barra de pesquisa do catálogo se ela existir em tela
            const buscaCat = document.getElementById("busca-catalogo");
            if (buscaCat) {
                buscaCat.oninput = function() {
                    renderizarTabelaCatalogo();
                };
            }
        })
        .catch(err => console.error("Erro ao carregar o catálogo:", err));
}

// FUNÇÃO AUXILIAR PARA RENDERIZAR E FILTRAR A TABELA DINAMICAMENTE
function renderizarTabelaCatalogo() {
    const corpoTabela = document.getElementById("tabela-corpo-produtos");
    if (!corpoTabela) return;
    
    corpoTabela.innerHTML = "";
    
    // Pega o termo digitado na barra de pesquisa
    const termoBusca = document.getElementById("busca-catalogo") ? document.getElementById("busca-catalogo").value.toLowerCase() : "";

    // 1. Filtra os dados primeiro por tipo e depois pelo termo de busca
    const dadosFiltrados = produtosCarregados.filter(prod => {
        const matchesTipo = (filtroTipoAtual === 'TODOS') || (prod.tipo === filtroTipoAtual);
        const matchesBusca = prod.nome.toLowerCase().includes(termoBusca) || prod.marca.toLowerCase().includes(termoBusca);
        return matchesTipo && matchesBusca;
    });

    // 2. ORGANIZAÇÃO COMPLEMENTAR: Ordena para que Amplificadores fiquem agrupados primeiro, e depois Alto-falantes
    dadosFiltrados.sort((a, b) => a.tipo.localeCompare(b.tipo));

    // 3. Desenha as linhas na tabela
    dadosFiltrados.forEach(prod => {
        const tr = document.createElement("tr");
        const pot = prod.potenciaRms || prod.potencia;
        const infoExtra = prod.tipo === "AMPLIFICADOR" ? ` (${prod.canais} Ch)` : "";
        
        // Define uma classe CSS diferente para o tipo de badge (estética)
        const classeBadge = prod.tipo === "AMPLIFICADOR" ? "badge-modulo" : "badge-falante";

        tr.innerHTML = `
            <td>${prod.nome}</td>
            <td>${prod.marca}</td>
            <td><span class="badge ${classeBadge}">${prod.tipo}</span></td>
            <td>${pot}W RMS</td>
            <td>${prod.impedancia}Ω${infoExtra}</td>
            <td class="btn-admin-acao">
                <button class="btn-tabela btn-editar" onclick='abrirModalEdicao(${JSON.stringify(prod)})'>Editar</button>
                <button class="btn-tabela btn-excluir" onclick="abrirModalDelecao(${prod.id}, '${prod.nome}')">Excluir</button>
            </td>
        `;
        corpoTabela.appendChild(tr);
    });

    verificarEstadoLogin(); // Mantém o bloqueio/exibição dos botões de Admin
}

// FUNÇÃO DISPARADA AO CLICAR NOS BOTÕES DE FILTRO (TODOS, MÓDULO, FALANTE)
function filtrarTipoCatalogo(tipo) {
    filtroTipoAtual = tipo;

    // Atualiza o estado visual dos botões de filtro (muda a classe ativa)
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
    
    if (tipo === 'TODOS') document.getElementById('filtro-todos').classList.add('ativo');
    if (tipo === 'AMPLIFICADOR') document.getElementById('filtro-modulo').classList.add('ativo');
    if (tipo === 'ALTO_FALANTE') document.getElementById('filtro-falante').classList.add('ativo');

    // Remonta a tabela instantaneamente
    renderizarTabelaCatalogo();
}

// 6. GERENCIAMENTO DE NOVOS ADMINS (DENTRO DA ABA ADM)
function executarCadastroUsuario() {
    let tokenRaw = sessionStorage.getItem('token') || sessionStorage.getItem('token_jwt') || sessionStorage.getItem('JWT');
    const token = tokenRaw ? tokenRaw.replace(/['"]+/g, '').trim() : '';
    const userIn = document.getElementById('new-username').value;
    const emailIn = document.getElementById('new-email') ? document.getElementById('new-email').value : '';
    const passIn = document.getElementById('new-password').value;

    if(!userIn || !passIn) return alert("Preencha usuário e senha!");

    fetch(`${API_AUTH_URL}/cadastrar`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ username: userIn, password: passIn, email: emailIn || null })
    })
    .then(async res => {
        const msg = await res.text();
        if(res.ok) {
            document.getElementById('new-username').value = '';
            document.getElementById('new-password').value = '';
            if(document.getElementById('new-email')) document.getElementById('new-email').value = '';
            carregarUsuarios();
            document.getElementById('modal-usuario-cadastrado-msg').innerHTML =
                `O administrador <strong>${userIn}</strong> foi cadastrado com sucesso no sistema!`;
            document.getElementById('modal-usuario-cadastrado').style.display = 'flex';
        } else if(msg.toLowerCase().includes('já está em uso') || res.status === 400) {
            document.getElementById('modal-usuario-em-uso-msg').innerHTML =
                `O usuário <strong>${userIn}</strong> já está cadastrado. Escolha outro nome.`;
            document.getElementById('modal-usuario-em-uso').style.display = 'flex';
        } else {
            alert("Erro ao criar usuário: " + msg);
        }
    });
}

function executarExclusaoUsuario() {
    let tokenRaw = sessionStorage.getItem('token') || sessionStorage.getItem('token_jwt') || sessionStorage.getItem('JWT');
    const token = tokenRaw ? tokenRaw.replace(/['"]+/g, '').trim() : '';
    const idIn = document.getElementById('delete-user-id').value;

    if(!idIn) return alert("Insira um ID válido!");

    fetch(`${API_AUTH_URL}/deletar/${idIn}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(async res => {
        const msg = await res.text();
        if(res.ok) {
            document.getElementById('delete-user-id').value = '';
            carregarUsuarios();
            document.getElementById('modal-usuario-deletado-msg').innerHTML =
                `O usuário de ID <strong>${idIn}</strong> foi removido permanentemente do sistema.`;
            document.getElementById('modal-usuario-deletado').style.display = 'flex';
        } else {
            alert("Erro ao remover usuário: " + msg);
        }
    });
}
// CARREGAR LISTA DE USUARIOS NO PAINEL ADMIN
function carregarUsuarios() {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    fetch(`${API_AUTH_URL}/usuarios`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(usuarios => {
        const corpo = document.getElementById('tabela-corpo-usuarios');
        if (!corpo) return;
        corpo.innerHTML = '';
        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.email || '-'}</td>
            `;
            corpo.appendChild(tr);
        });
    })
    .catch(err => console.error('Erro ao carregar usuários:', err));
}

// CARREGAR STATS DE COMPONENTES NO PAINEL ADMIN
function carregarStats() {
    fetch(API_URL)
    .then(res => res.json())
    .then(dados => {
        const total = document.getElementById('stat-total');
        if(total) total.innerText = dados.length;

        const porMarca = {};
        dados.forEach(c => {
            porMarca[c.marca] = (porMarca[c.marca] || 0) + 1;
        });

        const container = document.getElementById('stats-por-marca');
        if(!container) return;
        container.innerHTML = '';

        Object.entries(porMarca)
            .sort((a, b) => b[1] - a[1])
            .forEach(([marca, qtd]) => {
                const div = document.createElement('div');
                div.className = 'stat-marca-linha';
                div.innerHTML = `<span class="stat-marca-nome">${marca}</span><span class="stat-marca-qtd">${qtd}</span>`;
                container.appendChild(div);
            });
    })
    .catch(err => console.error('Erro ao carregar stats:', err));
}

// ==========================================================================
// ⌨️ SISTEMA DO TERMINAL OCULTO DE AUDITORIA (MÁGICA DO BACK-END)
// ==========================================================================
let sequenciaTeclas = "";
const PALAVRA_SECRETA = "bash";

window.addEventListener("keydown", (e) => {
    // Só captura se o usuário não estiver digitando em nenhum input de busca
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") {
        return;
    }

    sequenciaTeclas += e.key.toLowerCase();
    
    // Mantém o tamanho do buffer controlado
    if (sequenciaTeclas.length > 10) {
        sequenciaTeclas = sequenciaTeclas.slice(-4);
    }

    if (sequenciaTeclas.endsWith(PALAVRA_SECRETA)) {
        sequenciaTeclas = ""; // Limpa buffer
        abrirTerminalSecreto();
    }
});

function abrirTerminalSecreto() {
    const token = sessionStorage.getItem('token'); // Puxa do seu controle real de login

    // Validação de Segurança: Só abre se o usuário estiver de fato autenticado
    if (!token) {
        console.warn("Acesso negado: Sem token administrativo ativo.");
        return;
    }

    const modalTerminal = document.getElementById("terminalSecreto");
    if (modalTerminal) modalTerminal.style.display = "flex";

    const container = document.getElementById("logsContainer");
    if (!container) return;
    container.innerHTML = "<p style='color: #888;'>Buscando registros na tabela public.logs_auditoria...</p>";

    // Faz a chamada para o endpoint que criamos no Spring Boot
    fetch("http://localhost:8080/api/logs", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
    })
    .then(logs => {
        console.log("=== RETORNO DO BANCO ===", logs); // 🌟 Adicione essa linha aqui!
        container.innerHTML = "";

        if (logs.length === 0) {
            container.innerHTML = "<p style='color: #888;'>Nenhum registro de auditoria gravado no Neon banco ainda.</p>";
            return;
        }

        logs.forEach(log => {
            let corAcao = "#3399ff"; // Azul padrão
            if (log.acao.includes("FALHA")) corAcao = "#ff0055"; // Rosa/Vermelho neon
            if (log.acao.includes("SUCESSO")) corAcao = "#a3ff00"; // Verde neon

            const dataFormatada = new Date(log.dataHora).toLocaleString('pt-BR');

            container.innerHTML += `
                <p style="margin-bottom: 8px; border-bottom: 1px dashed #222; padding-bottom: 4px;">
                    <span style="color: #666;">[${dataFormatada}]</span> 
                    <span style="color: ${corAcao}; font-weight: bold;">[${log.acao}]</span> 
                    <span style="color: #fff;"><strong>Usuário:</strong> ${log.usuarioAdm}</span> <br>
                    <span style="color: #ccc; padding-left: 10px;">➔ ${log.descricao}</span>
                </p>
            `;
        });
    })
    .catch(err => {
        console.error(err);
        container.innerHTML = `<p style='color: #ff0055;'>➔ Erro ao carregar logs. Verifique se o endpoint GET /api/logs exige roles adequadas.</p>`;
    });
}

function fecharTerminal() {
    const modalTerminal = document.getElementById("terminalSecreto");
    if (modalTerminal) modalTerminal.style.display = "none";
}