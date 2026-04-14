/* ========================================
   ProvedorHealth — Checkout JavaScript
   Multi-step, pagamento, pedidos
   ======================================== */

// === ESTADO ===
let carrinho = JSON.parse(localStorage.getItem('ph_carrinho')) || [];
let currentStep = 1;
let selectedPayment = 'cartao';
let freteValor = 15.90;

// === ELEMENTOS ===
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const steps = document.querySelectorAll('.checkout-section');
const progressSteps = document.querySelectorAll('.progress-step');
const progressLines = document.querySelectorAll('.progress-line');

// Toast
let toastTimer;
function mostrarToast(msg) {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// === NAVEGAÇÃO DE ETAPAS ===
function goToStep(step) {
    currentStep = step;

    steps.forEach(s => {
        s.classList.toggle('hidden', parseInt(s.dataset.step) !== step);
    });

    progressSteps.forEach((ps, i) => {
        const stepNum = parseInt(ps.dataset.step);
        ps.classList.remove('active', 'done');
        if (stepNum === step) ps.classList.add('active');
        else if (stepNum < step) ps.classList.add('done');
    });

    progressLines.forEach((line, i) => {
        line.classList.toggle('done', i < step - 1);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    atualizarResumo();
}

// === RENDERIZAR CARRINHO (Step 1) ===
const imgMap = {
    'Estetoscópio': './src/assets/Imagem.jpg',
    'Jaleco': './src/assets/Imagem2.jpg',
    'Oxímetro': './src/assets/Imagem3.jpg',
    'Esfigmomanômetro': './src/assets/Imagem4.jpg',
    'Scrub Cirúrgico': './src/assets/Imagem5.png'
};

function renderCartReview() {
    const container = document.getElementById('cartReview');

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-checkout">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
                <p>Seu carrinho está vazio</p>
                <a href="index.html" style="color:var(--color-primary);">Voltar à loja</a>
            </div>
        `;
        document.getElementById('toStep2').style.display = 'none';
        return;
    }

    container.innerHTML = carrinho.map((item, i) => `
        <div class="review-item">
            <div class="review-item-img">
                <img src="${imgMap[item.nome] || ''}" alt="${item.nome}">
            </div>
            <div class="review-item-info">
                <h4>${item.nome}</h4>
                <p>R$ ${item.preco.toFixed(2).replace('.', ',')} cada</p>
            </div>
            <div class="review-item-actions">
                <button onclick="alterarQtd(${i}, -1)">−</button>
                <span>${item.quantidade}</span>
                <button onclick="alterarQtd(${i}, 1)">+</button>
                <button class="remove" onclick="removerItem(${i})">✕</button>
            </div>
            <div class="review-item-price">
                <strong>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</strong>
            </div>
        </div>
    `).join('');
}

function alterarQtd(index, delta) {
    carrinho[index].quantidade += delta;
    if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
    localStorage.setItem('ph_carrinho', JSON.stringify(carrinho));
    renderCartReview();
    atualizarResumo();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('ph_carrinho', JSON.stringify(carrinho));
    renderCartReview();
    atualizarResumo();
}

// === RESUMO LATERAL ===
function atualizarResumo() {
    const summaryItems = document.getElementById('summaryItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryFrete = document.getElementById('summaryFrete');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryDiscountLine = document.getElementById('summaryDiscountLine');
    const summaryDiscount = document.getElementById('summaryDiscount');

    const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const isPix = selectedPayment === 'pix';
    const desconto = isPix ? subtotal * 0.05 : 0;
    const total = subtotal + freteValor - desconto;

    summaryItems.innerHTML = carrinho.map(item => `
        <div class="summary-item">
            <span class="item-name">${item.nome} <span class="item-qty">×${item.quantidade}</span></span>
            <span class="item-price">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');

    summarySubtotal.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    summaryFrete.textContent = freteValor === 0 ? 'Grátis' : `R$ ${freteValor.toFixed(2).replace('.', ',')}`;
    
    if (isPix) {
        summaryDiscountLine.classList.remove('hidden');
        summaryDiscount.textContent = `-R$ ${desconto.toFixed(2).replace('.', ',')}`;
    } else {
        summaryDiscountLine.classList.add('hidden');
    }

    summaryTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// === FRETE ===
document.querySelectorAll('input[name="frete"]').forEach(radio => {
    radio.addEventListener('change', () => {
        freteValor = parseFloat(radio.value);
        atualizarResumo();
    });
});

// === STEP NAVIGATION ===
document.getElementById('toStep2').addEventListener('click', () => {
    if (carrinho.length === 0) {
        mostrarToast('Adicione produtos ao carrinho.');
        return;
    }
    // Verificar login
    const usuario = JSON.parse(localStorage.getItem('ph_usuario'));
    if (!usuario) {
        mostrarToast('Faça login para continuar.');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    goToStep(2);
});

document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));

// Endereço → Pagamento
document.getElementById('enderecoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const campos = ['end-cep', 'end-rua', 'end-numero', 'end-bairro', 'end-cidade', 'end-uf'];
    let valido = true;
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) { el.style.borderColor = '#ef4444'; valido = false; }
        else { el.style.borderColor = ''; }
    });
    if (!valido) { mostrarToast('Preencha todos os campos obrigatórios.'); return; }

    // Salvar endereço
    localStorage.setItem('ph_endereco', JSON.stringify({
        cep: document.getElementById('end-cep').value,
        rua: document.getElementById('end-rua').value,
        numero: document.getElementById('end-numero').value,
        complemento: document.getElementById('end-complemento').value,
        bairro: document.getElementById('end-bairro').value,
        cidade: document.getElementById('end-cidade').value,
        uf: document.getElementById('end-uf').value
    }));

    goToStep(3);
    gerarParcelas();
});

// Voltar do pagamento
document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));
document.getElementById('backToStep2Pix').addEventListener('click', () => goToStep(2));
document.getElementById('backToStep2Boleto').addEventListener('click', () => goToStep(2));

// === BUSCAR CEP (simulado com ViaCEP) ===
document.getElementById('buscarCep').addEventListener('click', async () => {
    const cep = document.getElementById('end-cep').value.replace(/\D/g, '');
    if (cep.length !== 8) {
        mostrarToast('CEP deve ter 8 dígitos.');
        return;
    }

    try {
        const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await resp.json();
        if (data.erro) {
            mostrarToast('CEP não encontrado.');
            return;
        }
        document.getElementById('end-rua').value = data.logradouro || '';
        document.getElementById('end-bairro').value = data.bairro || '';
        document.getElementById('end-cidade').value = data.localidade || '';
        document.getElementById('end-uf').value = data.uf || '';
        mostrarToast('Endereço preenchido!');
        document.getElementById('end-numero').focus();
    } catch {
        // Fallback: preencher com dados fictícios
        document.getElementById('end-rua').value = 'Rua Exemplo';
        document.getElementById('end-bairro').value = 'Centro';
        document.getElementById('end-cidade').value = 'São Paulo';
        document.getElementById('end-uf').value = 'SP';
        mostrarToast('Endereço preenchido (offline).');
    }
});

// Máscara CEP
document.getElementById('end-cep').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    e.target.value = v;
});

// === PAYMENT TABS ===
document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        selectedPayment = tab.dataset.method;

        document.getElementById('cartaoForm').classList.toggle('hidden', selectedPayment !== 'cartao');
        document.getElementById('pixForm').classList.toggle('hidden', selectedPayment !== 'pix');
        document.getElementById('boletoForm').classList.toggle('hidden', selectedPayment !== 'boleto');

        atualizarResumo();
    });
});

// === CARTÃO: MÁSCARAS ===
document.getElementById('card-numero').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 16) v = v.slice(0, 16);
    v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = v;

    // Detectar bandeira
    const brand = document.getElementById('cardBrand');
    const num = v.replace(/\s/g, '');
    if (num.startsWith('4')) brand.textContent = 'VISA';
    else if (/^5[1-5]/.test(num)) brand.textContent = 'MASTERCARD';
    else if (/^3[47]/.test(num)) brand.textContent = 'AMEX';
    else if (/^6011|^65/.test(num)) brand.textContent = 'DISCOVER';
    else brand.textContent = '';
});

document.getElementById('card-validade').addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 4) v = v.slice(0, 4);
    if (v.length > 2) v = v.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    e.target.value = v;
});

document.getElementById('card-cvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});

// === PARCELAS ===
function gerarParcelas() {
    const select = document.getElementById('card-parcelas');
    const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const total = subtotal + freteValor;

    select.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        const parcela = total / i;
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${i}x de R$ ${parcela.toFixed(2).replace('.', ',')}${i === 1 ? '' : ' sem juros'}`;
        select.appendChild(opt);
    }
}

// === PROCESSAR PAGAMENTO ===
function processarPedido(metodo) {
    const overlay = document.getElementById('processingOverlay');
    const title = document.getElementById('processingTitle');
    const msg = document.getElementById('processingMsg');

    overlay.classList.remove('hidden');

    const mensagens = {
        cartao: ['Processando pagamento...', 'Verificando dados do cartão...', 'Pagamento aprovado!'],
        pix: ['Gerando QR Code...', 'Registrando transação PIX...', 'PIX gerado com sucesso!'],
        boleto: ['Gerando boleto...', 'Registrando no sistema bancário...', 'Boleto gerado com sucesso!']
    };

    const msgs = mensagens[metodo];
    let step = 0;

    function next() {
        if (step < msgs.length) {
            title.textContent = msgs[step];
            step++;
            setTimeout(next, 1000);
        } else {
            overlay.classList.add('hidden');
            finalizarPedido(metodo);
        }
    }

    next();
}

function finalizarPedido(metodo) {
    // Gerar ID do pedido
    const orderId = 'PH-' + Date.now().toString().slice(-6);
    document.getElementById('orderId').textContent = `Pedido #${orderId}`;

    // Calcular valores
    const subtotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    const isPix = metodo === 'pix';
    const desconto = isPix ? subtotal * 0.05 : 0;
    const total = subtotal + freteValor - desconto;

    // Resumo final
    const osf = document.getElementById('orderSummaryFinal');
    let html = carrinho.map(item => `
        <div class="osf-line">
            <span>${item.nome} ×${item.quantidade}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');

    html += `<div class="osf-line"><span>Frete</span><span>${freteValor === 0 ? 'Grátis' : 'R$ ' + freteValor.toFixed(2).replace('.', ',')}</span></div>`;
    if (isPix) html += `<div class="osf-line"><span>Desconto PIX (5%)</span><span style="color:#10b981">-R$ ${desconto.toFixed(2).replace('.', ',')}</span></div>`;

    const metodoLabel = { cartao: 'Cartão de Crédito', pix: 'PIX', boleto: 'Boleto Bancário' };
    html += `<div class="osf-line"><span>Pagamento</span><span>${metodoLabel[metodo]}</span></div>`;
    html += `<div class="osf-line total"><span>Total</span><span>R$ ${total.toFixed(2).replace('.', ',')}</span></div>`;

    osf.innerHTML = html;

    // Salvar pedido no localStorage
    const pedidos = JSON.parse(localStorage.getItem('ph_pedidos')) || [];
    pedidos.push({
        id: orderId,
        itens: [...carrinho],
        subtotal,
        frete: freteValor,
        desconto,
        total,
        metodo,
        endereco: JSON.parse(localStorage.getItem('ph_endereco')),
        data: new Date().toISOString(),
        status: metodo === 'boleto' ? 'Aguardando Pagamento' : 'Confirmado'
    });
    localStorage.setItem('ph_pedidos', JSON.stringify(pedidos));

    // Limpar carrinho
    localStorage.removeItem('ph_carrinho');
    carrinho = [];

    // Esconder resumo lateral
    document.getElementById('checkoutSummary').style.display = 'none';

    goToStep(4);
}

// === SUBMIT CARTÃO ===
document.getElementById('cartaoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const campos = ['card-nome', 'card-numero', 'card-validade', 'card-cvv'];
    let valido = true;
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) { el.style.borderColor = '#ef4444'; valido = false; }
        else { el.style.borderColor = ''; }
    });

    const num = document.getElementById('card-numero').value.replace(/\s/g, '');
    if (num.length < 13) {
        document.getElementById('card-numero').style.borderColor = '#ef4444';
        valido = false;
    }

    if (!valido) { mostrarToast('Preencha os dados do cartão corretamente.'); return; }
    processarPedido('cartao');
});

// === SUBMIT PIX ===
document.getElementById('finalizarPix').addEventListener('click', () => processarPedido('pix'));

// === SUBMIT BOLETO ===
document.getElementById('finalizarBoleto').addEventListener('click', () => processarPedido('boleto'));

// === PREENCHER DADOS DO USUÁRIO ===
function preencherDadosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('ph_usuario'));
    if (usuario) {
        const cardNome = document.getElementById('card-nome');
        if (cardNome && !cardNome.value) {
            cardNome.value = `${usuario.nome} ${usuario.sobrenome}`.toUpperCase();
        }
    }
}

// === INIT ===
renderCartReview();
atualizarResumo();
goToStep(1);

// Preencher dados se logado
setTimeout(preencherDadosUsuario, 100);
