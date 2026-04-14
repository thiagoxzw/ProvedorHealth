
let carrinho = [];


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
const login = document.getElementById('login')


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
loginBtn.addEventListener('click',)


function adicionarItem(nome, preco) {
    const existente = carrinho.find(item => item.nome === nome);
    if (existente) {
        existente.quantidade++;
    } else {
        carrinho.push({ nome, preco: parseFloat(preco), quantidade: 1 });
    }
    atualizarCarrinho();
    mostrarToast(`${nome} adicionado ao carrinho!`);

    
    contador.classList.remove('bump');
    void contador.offsetWidth; // reflow
    contador.classList.add('bump');
}


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


function alterarQtd(index, delta) {
    carrinho[index].quantidade += delta;
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }
    atualizarCarrinho();
}


document.querySelectorAll('.btn-comprar').forEach(btn => {
    btn.addEventListener('click', () => {
        const nome = btn.dataset.nome;
        const preco = btn.dataset.preco;
        adicionarItem(nome, preco);
    });
});


let toastTimer;
function mostrarToast(msg) {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}


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

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Scroll to top button
    if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


const sections = document.querySelectorAll('section[id], main[id]');
const navLinks = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});


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


document.querySelector('.btn-checkout')?.addEventListener('click', () => {
    mostrarToast('Redirecionando para o pagamento...');
    setTimeout(() => {
        fecharCarrinho();
        carrinho = [];
        atualizarCarrinho();
        mostrarToast('Compra finalizada com sucesso! Obrigado!');
    }, 1500);
});
