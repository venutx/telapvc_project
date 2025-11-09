// DOM Elements
const promotionsToggle = document.getElementById("promotionsToggle");
const promotionsContent = document.getElementById("promotionsContent");
const chevronIcon = document.getElementById("chevronIcon");
const tabs = document.querySelectorAll(".tab");
const tabIndicator = document.querySelector(".tab-indicator");
const postsContent = document.getElementById("postsContent");
const mediaContent = document.getElementById("mediaContent");
const filterButtons = document.querySelectorAll(".filter-button");

// State
let activeTab = "posts";
let activeFilter = "todos";
let promotionsVisible = true;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  updateTabDisplay();
});

// Event Listeners
function setupEventListeners() {
  // Promotions toggle
  promotionsToggle.addEventListener("click", togglePromotions);

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => switchFilter(button.dataset.filter));
  });
  
  // Adiciona listener de clique para os botões de assinatura
  document.querySelectorAll(".subscription-button").forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault(); 
      
      const valor = parseFloat(button.dataset.valor);
      const plano = button.dataset.plano;
      
      if (!isNaN(valor) && plano) {
        abrirPixPopup(valor, plano);
      } else {
        console.error("Dados de valor ou plano inválidos no botão de assinatura.");
      }
    });
  });
}

// Promotions functionality
function togglePromotions() {
  promotionsVisible = !promotionsVisible;

  if (promotionsVisible) {
    promotionsContent.classList.remove("collapsed");
    chevronIcon.classList.remove("rotated");
    promotionsContent.classList.add("animate-in");
  } else {
    promotionsContent.classList.add("collapsed");
    chevronIcon.classList.add("rotated");
  }
}

// Tab switching functionality
function switchTab(tab) {
  if (activeTab === tab) return;

  activeTab = tab;

  // Update active tab styles
  tabs.forEach((tabElement) => {
    tabElement.classList.remove("active");
  });

  const activeTabElement = document.querySelector(`[data-tab="${tab}"]`);
  activeTabElement.classList.add("active");

  // Update tab indicator
  if (tab === "posts") {
    tabIndicator.classList.remove("media");
  } else {
    tabIndicator.classList.add("media");
  }

  // Switch content with animation
  updateTabDisplay();
}

function updateTabDisplay() {
  if (activeTab === "posts") {
    postsContent.classList.remove("hidden");
    mediaContent.classList.add("hidden");
  } else {
    postsContent.classList.add("hidden");
    mediaContent.classList.remove("hidden");
  }
}

// Filter functionality
function switchFilter(filter) {
  if (activeFilter === filter) return;

  activeFilter = filter;

  // Update active filter styles
  filterButtons.forEach((button) => {
    button.classList.remove("active");
  });

  const activeFilterElement = document.querySelector(
    `[data-filter="${filter}"]`
  );
  activeFilterElement.classList.add("active");

  // Here you could add filtering logic for the media items
  // For now, all items are always visible
  console.log(`Filtering by: ${filter}`);
}



// Optional: Add keyboard navigation
document.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    // Let default tab behavior work
    return;
  }

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    const newTab = activeTab === "posts" ? "media" : "posts";
    switchTab(newTab);
  }
});

// =================================================================
// Lógica de Pagamento PIX
// =================================================================

const pixPopup = document.getElementById("pix-popup");
const pixPlanoNome = document.getElementById("pix-plano-nome");
const pixValor = document.getElementById("pix-valor");
const pixQrCodeContainer = document.getElementById("pix-qr-code-container");
const pixCopiaColaButton = document.getElementById("pix-copia-cola-button");
const pixStatusMsg = document.getElementById("pix-status-msg");

let pixCopiaColaText = "";
let pixInterval = null;
let pixTxid = null;

// Função para formatar o valor em BRL
function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// 1. Abrir o Pop-up e Chamar a API
async function abrirPixPopup(valor, plano) {
  // Limpar estado anterior
  pixQrCodeContainer.innerHTML = '<p>Gerando QR Code...</p>';
  document.getElementById("pix-copia-cola-text").textContent = 'Código PIX';
  document.getElementById("pix-copia-cola-text").style.display = 'none';
  pixCopiaColaButton.style.display = 'none';
  pixStatusMsg.textContent = 'Aguardando pagamento...';
  pixStatusMsg.style.color = '#ff8c00'; // Laranja do novo visual
  
  // Preencher informações do plano
  // Não há elemento para o nome do plano no novo visual, apenas o valor
  // pixPlanoNome.textContent = plano; 
  pixValor.textContent = formatarValor(valor);
  
  // Exibir o pop-up
  pixPopup.classList.add("active");

  try {
    // Chamar a API para gerar o PIX com a nova estrutura de body
    const response = await fetch('/api/gerar-pix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        value: valor, // 'value' em vez de 'valor'
        name: 'Cliente', // Hardcoded, pode ser alterado se o cliente fornecer um campo de nome
        email: 'cliente@exemplo.com', // Hardcoded, pode ser alterado
        description: `Assinatura ${plano}`,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Sucesso na geração
      pixTxid = data.payment_id; // 'payment_id' em vez de 'txid'
      pixCopiaColaText = data.qr_code_text; // 'qr_code_text' em vez de 'pixCopiaECola'
      document.getElementById("pix-copia-cola-text").textContent = pixCopiaColaText;
      document.getElementById("pix-copia-cola-text").style.display = 'block';
      
      // Exibir QR Code
      // A API retorna o QR Code em base64
      pixQrCodeContainer.innerHTML = `<img src="data:image/png;base64,${data.qr_code_base64}" alt="QR Code PIX">`;
      
      // Exibir botão Copia e Cola
      pixCopiaColaButton.style.display = 'block';
      
      // Iniciar monitoramento do pagamento
      iniciarMonitoramentoPix(pixTxid);

    } else {
      // Erro na API
      pixQrCodeContainer.innerHTML = `<p style="color: red;">Erro ao gerar PIX: ${data.error.message || 'Tente novamente.'}</p>`;
      pixStatusMsg.textContent = 'Erro na geração do PIX.';
      pixStatusMsg.style.color = 'red';
    }

  } catch (error) {
    console.error('Erro de rede:', error);
    pixQrCodeContainer.innerHTML = `<p style="color: red;">Erro de conexão. Verifique sua internet.</p>`;
    pixStatusMsg.textContent = 'Erro de conexão.';
    pixStatusMsg.style.color = 'red';
  }
}

// 2. Fechar o Pop-up
function fecharPixPopup() {
  pixPopup.classList.remove("active");
  pararMonitoramentoPix();
}

// 3. Copiar o Código PIX
function copiarPix() {
  if (pixCopiaColaText) {
    navigator.clipboard.writeText(pixCopiaColaText).then(() => {
      const originalText = pixCopiaColaButton.textContent;
      pixCopiaColaButton.textContent = "Copiado!";
      setTimeout(() => {
        pixCopiaColaButton.textContent = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Erro ao copiar:', err);
      alert('Erro ao copiar o código PIX. Tente manualmente.');
    });
  }
}

// 4. Monitoramento do Pagamento (Polling)
function iniciarMonitoramentoPix(txid) {
  // Parar qualquer monitoramento anterior
  pararMonitoramentoPix(); 

  // A cada 5 segundos, verifica o status
  pixInterval = setInterval(async () => {
    try {
      // Nota: Em um ambiente de produção, o ideal é usar WebSockets
      // ou o Webhook da WiinPay para confirmação instantânea.
      // Este polling é um fallback simples.
      
      // Chamar a API para verificar o status (precisaria de um endpoint /api/verificar-pix)
      // Como não temos esse endpoint, vamos simular a verificação
      // Em um ambiente real, você faria:
      /*
      const response = await fetch('/api/verificar-pix?txid=' + txid);
      const data = await response.json();
      
      if (data.status === 'CONCLUIDA') {
        pixStatusMsg.textContent = 'Pagamento Confirmado!';
        pixStatusMsg.style.color = 'green';
        pararMonitoramentoPix();
        // Redirecionar ou liberar acesso
        window.location.href = '/pagina-de-obrigado'; // ESPAÇO PARA PÁGINA DE OBRIGADO

      } else if (data.status === 'EXPIRADA') {
        pixStatusMsg.textContent = 'PIX Expirado. Gere um novo.';
        pixStatusMsg.style.color = 'red';
        pararMonitoramentoPix();
      }
      */
      
      // Simulação: Se o usuário fechar o pop-up, o monitoramento para.
      // Se o pop-up estiver aberto, continua a simulação.
      if (!pixPopup.classList.contains("active")) {
        pararMonitoramentoPix();
      }

    } catch (error) {
      console.error('Erro ao monitorar PIX:', error);
    }
  }, 5000); // 5 segundos
}

function pararMonitoramentoPix() {
  if (pixInterval) {
    clearInterval(pixInterval);
    pixInterval = null;
  }
}

// Fechar o pop-up ao clicar fora
pixPopup.addEventListener('click', (e) => {
  if (e.target === pixPopup) {
    fecharPixPopup();
  }
});
