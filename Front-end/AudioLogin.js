// URL base da sua API Java
const API_AUTH_URL = 'http://localhost:8080/auth';

// Roda automaticamente assim que a página abre
document.addEventListener("DOMContentLoaded", () => {
    verificarEstadoLogin();
});

// 1. GERENCIAR ESTADO DA TELA (Esconder/Mostrar o que precisa)
function verificarEstadoLogin() {
    const token = sessionStorage.getItem('token');
    const loginBox = document.getElementById('login-box');
    const userManagementBox = document.getElementById('user-management-box');
    
    // Busca a classe exata (.btn-admin-acao) usada no catálogo principal
    const botoesAdminProdutos = document.querySelectorAll('.btn-admin-acao');

    if (token) {
        if(loginBox) loginBox.style.display = 'none';
        if(userManagementBox) userManagementBox.style.display = 'block';
        botoesAdminProdutos.forEach(botao => botao.style.display = 'inline-block');
    } else {
        if(loginBox) loginBox.style.display = 'block';
        if(userManagementBox) userManagementBox.style.display = 'none';
        botoesAdminProdutos.forEach(botao => botao.style.display = 'none');
    }
}

// 2. FUNÇÃO DE LOGIN UNIFICADA E CORRIGIDA (Captura o submit corretamente)
function executarLoginAdmin(event) {
    // CRÍTICO: Impede que a página recarregue e cancele o fetch
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    // Suporta tanto os IDs antigos ('login-username') quanto os novos do card moderno ('username')
    const campoUser = document.getElementById('username') || document.getElementById('login-username');
    const campoPass = document.getElementById('password') || document.getElementById('login-password');

    const userIn = campoUser ? campoUser.value : '';
    const passIn = campoPass ? campoPass.value : '';

    if (!userIn || !passIn) {
        alert("Por favor, preencha o usuário e a senha!");
        return;
    }

    const modal = document.getElementById('modal-login-alerta');
    const msgTexto = document.getElementById('modal-login-mensagem');
    const tituloTexto = document.getElementById('modal-login-titulo');
    const btnFechar = document.getElementById('btn-fechar-login-alerta');

    fetch(`${API_AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userIn, password: passIn })
    })
    .then(res => {
        if (!res.ok) throw new Error('Usuário ou senha incorretos.');
        return res.json();
    })
    .then(data => {
        // Salva o token retornado pela API
        sessionStorage.setItem('token', data.token);
        
        // Configura o modal para Sucesso se ele existir na tela
        if (tituloTexto) {
            tituloTexto.innerText = "⚡ ACESSO LIBERADO";
            tituloTexto.style.color = "#a3ff00"; 
        }
        if (msgTexto) msgTexto.innerText = "Autenticação realizada com sucesso! Redirecionando...";
        if (modal) modal.style.display = "flex";

        if (btnFechar) {
            btnFechar.onclick = () => {
                modal.style.display = "none";
                window.location.href = 'AudioGear.html';
            };
        }

        // Redirecionamento automático após 1.5 segundos
        setTimeout(() => {
            window.location.href = 'AudioGear.html';
        }, 1500);
    })
    .catch(err => {
        // Configura o modal para Erro
        if (tituloTexto) {
            tituloTexto.innerText = "❌ ERRO DE LOGIN";
            tituloTexto.style.color = "#ff0055"; 
        }
        if (msgTexto) msgTexto.innerText = err.message;
        if (modal) modal.style.display = "flex";

        if (btnFechar) {
            btnFechar.onclick = () => {
                modal.style.display = "none";
            };
        } else {
            // Fallback caso não tenha modal de erro estruturado em HTML ainda
            alert(err.message);
        }
    });
}

// 3. FUNÇÃO DE LOGOUT
function executarLogout() {
    sessionStorage.removeItem('token');
    alert('Sessão encerrada.');
    window.location.reload();
}

// 4. CADASTRO DE NOVO USUÁRIO (COM PROTEÇÃO)
function executarCadastroUsuario() {
    const token = sessionStorage.getItem('token');
    const userIn = document.getElementById('new-username').value;
    const passIn = document.getElementById('new-password').value;

    if (!token) {
        alert("Você precisa estar logado como administrador para cadastrar outros usuários.");
        return;
    }

    fetch(`${API_AUTH_URL}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userIn, password: passIn })
    })
    .then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text) });
        return res.text();
    })
    .then(msg => {
        alert(msg);
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
    })
    .catch(err => alert(err.message));
}

// 5. REMOÇÃO DE USUÁRIO (AJUSTADO COM TOKEN)
function executarExclusaoUsuario() {
    const token = sessionStorage.getItem('token');
    const id = document.getElementById('delete-user-id').value;

    if (!id) return alert("Insira um ID válido.");

    fetch(`${API_AUTH_URL}/deletar/${id}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
    })
    .then(res => {
        if (!res.ok) return res.text().then(text => { throw new Error(text) });
        return res.text();
    })
    .then(msg => {
        alert(msg);
        document.getElementById('delete-user-id').value = '';
    })
    .catch(err => alert(err.message));
}

// --- MAPEAMENTO DE COMPATIBILIDADE PARA O FORMULÁRIO HTML ---
var executarLogin = executarLoginAdmin;