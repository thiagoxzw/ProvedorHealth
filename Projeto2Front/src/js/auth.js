/* ========================================
   ProvedorHealth — Auth (Login / Cadastro)
   Dados salvos em localStorage
   ======================================== */

// === ELEMENTOS ===
const tabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const cadastroForm = document.getElementById('cadastroForm');
const loginMessage = document.getElementById('loginMessage');
const cadastroMessage = document.getElementById('cadastroMessage');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const contador = document.getElementById('carrinho-contador');

// === TABS ===
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'login') {
            loginForm.classList.remove('hidden');
            cadastroForm.classList.add('hidden');
        } else {
            loginForm.classList.add('hidden');
            cadastroForm.classList.remove('hidden');
        }

        loginMessage.textContent = '';
        cadastroMessage.textContent = '';
        loginMessage.className = 'auth-message';
        cadastroMessage.className = 'auth-message';
    });
});

// === MOSTRAR/OCULTAR SENHA ===
document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        input.type = input.type === 'password' ? 'text' : 'password';
    });
});

// === MÁSCARA CPF ===
const cpfInput = document.getElementById('cad-cpf');
cpfInput.addEventListener('input', () => {
    let v = cpfInput.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    cpfInput.value = v;
});

// === MÁSCARA TELEFONE ===
const telInput = document.getElementById('cad-telefone');
telInput.addEventListener('input', () => {
    let v = telInput.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    telInput.value = v;
});

// === FORÇA DA SENHA ===
const senhaInput = document.getElementById('cad-senha');
const strengthBars = document.querySelector('.strength-bars');
const strengthText = document.getElementById('strengthText');

senhaInput.addEventListener('input', () => {
    const val = senhaInput.value;
    let score = 0;

    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    let level = 0;
    let text = '';
    let color = '';

    if (val.length === 0) {
        level = 0; text = '';
    } else if (score <= 1) {
        level = 1; text = 'Fraca'; color = '#ef4444';
    } else if (score === 2) {
        level = 2; text = 'Regular'; color = '#f59e0b';
    } else if (score === 3) {
        level = 3; text = 'Boa'; color = '#0ea5e9';
    } else {
        level = 4; text = 'Forte'; color = '#10b981';
    }

    strengthBars.className = `strength-bars level-${level}`;
    strengthText.textContent = text;
    strengthText.style.color = color;
});

// === TOAST ===
let toastTimer;
function mostrarToast(msg) {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// === VALIDAÇÃO HELPERS ===
function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCPF(cpf) {
    return cpf.replace(/\D/g, '').length === 11;
}

// === LOGIN ===
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    loginMessage.textContent = '';
    loginMessage.className = 'auth-message';

    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    let valido = true;

    if (!validarEmail(email)) {
        showError('login-email-error', 'E-mail inválido');
        valido = false;
    }
    if (senha.length < 6) {
        showError('login-senha-error', 'Mínimo de 6 caracteres');
        valido = false;
    }
    if (!valido) return;

    // Buscar usuários cadastrados
    const usuarios = JSON.parse(localStorage.getItem('ph_usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        loginMessage.textContent = 'E-mail ou senha incorretos.';
        loginMessage.className = 'auth-message error';
        return;
    }

    // Salvar sessão
    localStorage.setItem('ph_usuario', JSON.stringify({
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone
    }));

    loginMessage.textContent = 'Login realizado com sucesso!';
    loginMessage.className = 'auth-message success';
    mostrarToast(`Bem-vindo(a), ${usuario.nome}!`);

    // Redirecionar após 1s
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
});

// === CADASTRO ===
cadastroForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();
    cadastroMessage.textContent = '';
    cadastroMessage.className = 'auth-message';

    const nome = document.getElementById('cad-nome').value.trim();
    const sobrenome = document.getElementById('cad-sobrenome').value.trim();
    const cpf = document.getElementById('cad-cpf').value.trim();
    const email = document.getElementById('cad-email').value.trim();
    const telefone = document.getElementById('cad-telefone').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const confirma = document.getElementById('cad-confirma').value;
    let valido = true;

    if (nome.length < 2) { showError('cad-nome-error', 'Nome obrigatório'); valido = false; }
    if (sobrenome.length < 2) { showError('cad-sobrenome-error', 'Sobrenome obrigatório'); valido = false; }
    if (!validarCPF(cpf)) { showError('cad-cpf-error', 'CPF inválido'); valido = false; }
    if (!validarEmail(email)) { showError('cad-email-error', 'E-mail inválido'); valido = false; }
    if (telefone.replace(/\D/g, '').length < 10) { showError('cad-telefone-error', 'Telefone inválido'); valido = false; }
    if (senha.length < 6) { showError('cad-senha-error', 'Mínimo 6 caracteres'); valido = false; }
    if (senha !== confirma) { showError('cad-confirma-error', 'Senhas não coincidem'); valido = false; }
    if (!valido) return;

    // Verificar se já existe
    const usuarios = JSON.parse(localStorage.getItem('ph_usuarios')) || [];
    if (usuarios.find(u => u.email === email)) {
        showError('cad-email-error', 'E-mail já cadastrado');
        return;
    }
    if (usuarios.find(u => u.cpf === cpf)) {
        showError('cad-cpf-error', 'CPF já cadastrado');
        return;
    }

    // Salvar novo usuário
    const novoUsuario = { nome, sobrenome, cpf, email, telefone, senha, dataCadastro: new Date().toISOString() };
    usuarios.push(novoUsuario);
    localStorage.setItem('ph_usuarios', JSON.stringify(usuarios));

    // Auto-login
    localStorage.setItem('ph_usuario', JSON.stringify({
        nome, sobrenome, email, cpf, telefone
    }));

    cadastroMessage.textContent = 'Conta criada com sucesso!';
    cadastroMessage.className = 'auth-message success';
    mostrarToast(`Bem-vindo(a), ${nome}!`);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
});

// === ATUALIZAR CONTADOR DO CARRINHO ===
function atualizarContador() {
    const carrinho = JSON.parse(localStorage.getItem('ph_carrinho')) || [];
    const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    if (contador) contador.textContent = total;
}

atualizarContador();

// Se já está logado, redirecionar
const usuarioLogado = localStorage.getItem('ph_usuario');
if (usuarioLogado) {
    // Opcional: redirecionar se já logado
    // window.location.href = 'index.html';
}
