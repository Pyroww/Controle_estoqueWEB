document.addEventListener('DOMContentLoaded', () => {
    // Seletores de Elementos
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');
    const lowStockMenu = document.getElementById('lowStockMenu');
    const bestSellersMenu = document.getElementById('bestSellersMenu');
    const modal = document.getElementById('reportModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeButton = document.querySelector('.close-button');

    // Constantes e Cache Local
    const API_URL = '/api/produtos';
    let localProductsCache = []; // Cache local para busca e relatórios rápidos

    // --- FUNÇÕES DE COMUNICAÇÃO COM A API (BACKEND) ---

    const fetchAndRenderProducts = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao buscar produtos do servidor.');
            
            const products = await response.json();
            localProductsCache = products.sort((a, b) => b.id - a.id); // Ordena pelos mais recentes
            renderProducts(localProductsCache);
        } catch (error) {
            console.error(error);
            productList.innerHTML = `<p style="color:red;">Falha ao carregar produtos. Verifique se o backend Java está rodando.</p>`;
        }
    };

    const addProduct = async (e) => {
    e.preventDefault();
    const newProduct = {
    nome: document.getElementById('productName').value,
    imagemUrl: document.getElementById('productImage').value, // Verifique se o nome é imagemUrl
    quantidade: parseInt(document.getElementById('productQuantity').value, 10),
    preco: parseFloat(document.getElementById('productPrice').value),
    // O campo "vendas" será controlado pelo backend, não precisa enviar
};

    // ... resto da função continua igual (try/catch com o fetch)
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        if (!response.ok) throw new Error('Erro ao adicionar produto.');

        productForm.reset();
        fetchAndRenderProducts();
    } catch (error) {
        console.error(error);
        alert('Falha ao adicionar produto.');
    }
};
    
    const removeProduct = async (productId) => {
        if (!confirm('Tem certeza de que deseja remover este produto?')) return;

        try {
            const response = await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao remover produto.');

            fetchAndRenderProducts();
        } catch (error) {
            console.error(error);
            alert('Falha ao remover produto.');
        }
    };
    
    const updateProduct = async (product) => {
         try {
            const response = await fetch(`${API_URL}/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (!response.ok) throw new Error('Erro ao atualizar produto.');
            
            const index = localProductsCache.findIndex(p => p.id === product.id);
            if(index !== -1) localProductsCache[index] = product;
            
        } catch (error) {
            console.error(error);
            alert('Falha ao atualizar produto no servidor.');
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO E MANIPULAÇÃO DA UI ---

    const renderProducts = (productsToRender) => {
    productList.innerHTML = '';

    // ***** LÓGICA NOVA AQUI *****
    let totalInventoryValue = 0; // Variável para somar o valor total

    if (productsToRender.length === 0) {
        productList.innerHTML = '<p>Nenhum produto cadastrado.</p>';
    } else {
        productsToRender.forEach(product => {
            // Calcula o subtotal para este produto
            const subtotal = (product.preco || 0) * product.quantidade;
            totalInventoryValue += subtotal; // Soma ao total geral

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.id = product.id;
            productCard.dataset.product = JSON.stringify(product);

            productCard.innerHTML = `
                <img src="${product.imagemUrl || 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" alt="${product.nome}" class="product-image">
                <div class="product-info">
                    <h3>${product.nome}</h3>

                    <p class="product-price">Preço Unitário: ${(product.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p class="product-quantity">Estoque: <span class="quantity">${product.quantidade}</span></p>
                    <p class="product-subtotal">Valor em Estoque: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>

                    <div class="quantity-controls">
                        <button class="decrease-btn">-</button>
                        <input type="number" value="1" class="quantity-change" min="1">
                        <button class="increase-btn">+</button>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn-remove"><i class="fas fa-trash-alt"></i> Remover</button>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    // ***** ATUALIZA O CARD DE RESUMO FINAL *****
    const summaryCard = document.getElementById('inventorySummary');
    summaryCard.innerHTML = `
        <h3>Valor Total do Estoque</h3>
        <p>${totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
    `;
};
    
    const handleListClick = (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const productId = card.dataset.id;
        let product = JSON.parse(card.dataset.product);
        
        if (e.target.closest('.btn-remove')) {
            removeProduct(productId);
            return;
        }
        
        if (e.target.closest('.quantity-controls')) {
            const changeAmount = parseInt(card.querySelector('.quantity-change').value, 10) || 1;
            let quantityChanged = false;

            if (e.target.classList.contains('decrease-btn')) {
                if(product.quantidade > 0) {
                   const amountToDecrease = Math.min(product.quantidade, changeAmount);
                   product.quantidade -= amountToDecrease;
                   product.vendas += amountToDecrease;
                   quantityChanged = true;
                }
            } else if (e.target.classList.contains('increase-btn')) {
                product.quantidade += changeAmount;
                quantityChanged = true;
            }

            if(quantityChanged) {
                card.querySelector('.quantity').textContent = product.quantidade;
                card.dataset.product = JSON.stringify(product);
                updateProduct(product);
            }
        }
    };
    
    const searchProducts = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = localProductsCache.filter(product => product.nome.toLowerCase().includes(searchTerm));
        renderProducts(filtered);
    };

    // --- FUNÇÕES DE RELATÓRIO CORRIGIDAS ---

    const showLowStock = () => {
        const LOW_STOCK_THRESHOLD = 10;
        const lowStockProducts = localProductsCache.filter(p => p.quantidade < LOW_STOCK_THRESHOLD).sort((a, b) => a.quantidade - b.quantidade);
        
        modalTitle.textContent = 'Produtos com Baixo Estoque';
        let reportHTML = '<div class="product-grid">';

        if (lowStockProducts.length > 0) {
            lowStockProducts.forEach(p => {
                reportHTML += `
                    <div class="product-card">
                        <img src="${p.imagemUrl || 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" class="product-image">
                        <div class="product-info">
                            <h3>${p.nome}</h3>
                            <p style="color: var(--danger-color);">Estoque: ${p.quantidade}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            reportHTML = '<p>Nenhum produto com baixo estoque no momento.</p>';
        }
        reportHTML += '</div>';
        modalBody.innerHTML = reportHTML;
        modal.style.display = 'block';
    };

    const showBestSellers = () => {
        const bestSellers = [...localProductsCache].filter(p => p.vendas > 0).sort((a, b) => b.vendas - a.vendas).slice(0, 5);
        
        modalTitle.textContent = 'Top 5 Produtos Mais Vendidos';
        let reportHTML = '<div class="product-grid">';
        
        if (bestSellers.length > 0) {
            bestSellers.forEach(p => {
                reportHTML += `
                    <div class="product-card">
                         <img src="${p.imagemUrl || 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" class="product-image">
                         <div class="product-info">
                            <h3>${p.nome}</h3>
                            <p style="color: #28a745;">Vendas: ${p.vendas}</p>
                         </div>
                    </div>
                `;
            });
        } else {
            reportHTML = '<p>Ainda não há dados de vendas suficientes.</p>';
        }
        reportHTML += '</div>';
        modalBody.innerHTML = reportHTML;
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = "none";
    }

    // --- EVENT LISTENERS COMPLETOS ---

    productForm.addEventListener('submit', addProduct);
    productList.addEventListener('click', handleListClick);
    searchInput.addEventListener('keyup', searchProducts);
    
    // Listeners para os menus e modal que estavam faltando
    lowStockMenu.addEventListener('click', showLowStock);
    bestSellersMenu.addEventListener('click', showBestSellers);
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // --- CARGA INICIAL DOS DADOS ---
    fetchAndRenderProducts();
});