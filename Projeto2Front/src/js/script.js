/* ========================================
   ProvedorHealth — JavaScript Principal
   Carrinho com localStorage, Auth State
   ======================================== */

// === CARRINHO (localStorage) ===
let carrinho = JSON.parse(localStorage.getItem('ph_carrinho')) || [];

function salvarCarrinho() {
    localStorage.setItem('ph_carrinho', JSON.stringify(carrinho));
}

// === ELEMENTOS ===
const carrinhoBtn = document.getElementById('carrinhoBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const contador = document.getElementById('carrinho-contador');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scrollTop');
const newsletterBtn = document.getElementById('newsletterBtn');
const emailInput = document.getElementById('emailInput');
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');
const userName = document.getElementById('userName');
const dropdownHeader = document.getElementById('dropdownHeader');
const loginLink = document.getElementById('loginLink');
const logoutBtn = document.getElementById('logoutBtn');
const meusPedidos = document.getElementById('meusPedidos');
const btnCheckout = document.getElementById('btnCheckout');

// === CARRINHO: ABRIR / FECHAR ===
function abrirCarrinho() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function fecharCarrinho() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

carrinhoBtn.addEventListener('click', abrirCarrinho);
cartClose.addEventListener('click', fecharCarrinho);
cartOverlay.addEventListener('click', fecharCarrinho);

// === CARRINHO: ADICIONAR ITEM ===
function adicionarItem(nome, preco) {
    const existente = carrinho.find(item => item.nome === nome);
    if (existente) {
        existente.quantidade++;
    } else {
        carrinho.push({ nome, preco: parseFloat(preco), quantidade: 1 });
    }
    salvarCarrinho();
    atualizarCarrinho();
    mostrarToast(`${nome} adicionado ao carrinho!`);

    contador.classList.remove('bump');
    void contador.offsetWidth;
    contador.classList.add('bump');
}

// === CARRINHO: ATUALIZAR UI ===
function atualizarCarrinho() {
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const totalPreco = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

    contador.textContent = totalItens;

    if (carrinho.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Seu carrinho está vazio</p>';
        cartFooter.style.display = 'none';
        return;
    }

    cartFooter.style.display = 'block';
    cartTotal.textContent = `R$ ${totalPreco.toFixed(2).replace('.', ',')}`;

    cartItems.innerHTML = carrinho.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.nome}</h4>
                <p>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="cart-item-actions">
                <button onclick="alterarQtd(${index}, -1)">−</button>
                <span>${item.quantidade}</span>
                <button onclick="alterarQtd(${index}, 1)">+</button>
            </div>
        </div>
    `).join('');
}

// === CARRINHO: ALTERAR QUANTIDADE ===
function alterarQtd(index, delta) {
    carrinho[index].quantidade += delta;
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }
    salvarCarrinho();
    atualizarCarrinho();
}

// === BOTÕES COMPRAR ===
document.querySelectorAll('.btn-comprar').forEach(btn => {
    btn.addEventListener('click', () => {
        adicionarItem(btn.dataset.nome, btn.dataset.preco);
    });
});

// === CHECKOUT ===
if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
        if (carrinho.length === 0) {
            mostrarToast('Adicione produtos ao carrinho primeiro.');
            return;
        }
        fecharCarrinho();
        window.location.href = 'checkout.html';
    });
}

// === TOAST ===
let toastTimer;
function mostrarToast(msg) {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// === MENU MOBILE ===
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('open');
        document.body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
    });

    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

// === HEADER SCROLL ===
window.addEventListener('scroll', () => {
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }
    if (scrollTopBtn) {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }
});

// === SCROLL TO TOP ===
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// === ACTIVE NAV LINK ===
const sections = document.querySelectorAll('section[id], main[id]');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 120) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
});

// === NEWSLETTER ===
if (newsletterBtn) {
    newsletterBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (!email || !email.includes('@') || !email.includes('.')) {
            mostrarToast('Por favor, insira um e-mail válido.');
            emailInput.focus();
            return;
        }
        mostrarToast('Inscrição realizada com sucesso!');
        emailInput.value = '';
    });
}

// === ANIMAÇÃO DE ENTRADA ===
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.produto-card, .beneficio').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// === USER AUTH STATE ===
function verificarUsuario() {
    const usuario = JSON.parse(localStorage.getItem('ph_usuario'));

    if (usuario) {
        if (userName) userName.textContent = usuario.nome;
        if (dropdownHeader) {
            dropdownHeader.innerHTML = `
                <strong>${usuario.nome} ${usuario.sobrenome}</strong>
                <small>${usuario.email}</small>
            `;
        }
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'flex';
        if (meusPedidos) meusPedidos.style.display = 'flex';
    } else {
        if (userName) userName.textContent = 'Entrar';
        if (dropdownHeader) dropdownHeader.innerHTML = '<p>Você não está logado</p>';
        if (loginLink) loginLink.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (meusPedidos) meusPedidos.style.display = 'none';
    }
}

// User dropdown toggle
if (userBtn) {
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!userBtn.contains(e.target)) {
            userDropdown.classList.remove('open');
        }
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('ph_usuario');
        verificarUsuario();
        userDropdown.classList.remove('open');
        mostrarToast('Você saiu da sua conta.');
    });
}

// Meus Pedidos
if (meusPedidos) {
    meusPedidos.addEventListener('click', (e) => {
        e.preventDefault();
        const pedidos = JSON.parse(localStorage.getItem('ph_pedidos')) || [];
        if (pedidos.length === 0) {
            mostrarToast('Você ainda não tem pedidos.');
        } else {
            mostrarToast(`Você tem ${pedidos.length} pedido(s) registrado(s).`);
        }
        userDropdown.classList.remove('open');
    });
}

// === INICIALIZAR ===
atualizarCarrinho();
verificarUsuario();
