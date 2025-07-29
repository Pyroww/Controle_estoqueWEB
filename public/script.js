document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DE ELEMENTOS ---
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput'); // Selector da busca
    const searchButton = document.getElementById('searchButton'); // Selector do botão de busca
    const lowStockMenu = document.getElementById('lowStockMenu');
    const bestSellersMenu = document.getElementById('bestSellersMenu');
    // Elementos do Modal
    const modal = document.getElementById('reportModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeButton = document.querySelector('.close-button');

    const API_URL = '/api/produtos';
    let localProductsCache = []; // Cache local para busca e relatórios rápidos

    // --- FUNÇÕES DE COMUNICAÇÃO COM A API ---

    const fetchAndRenderProducts = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao buscar produtos.');
            const products = await response.json();
            localProductsCache = products; 
            renderProducts(products);
        } catch (error) {
            console.error(error);
            productList.innerHTML = `<p style="color:red;">Falha ao carregar produtos.</p>`;
        }
    };

    const addProduct = async (e) => {
        e.preventDefault();
        const newProduct = {
            nome: document.getElementById('productName').value,
            imagemUrl: document.getElementById('productImage').value,
            quantidade: parseInt(document.getElementById('productQuantity').value, 10),
            preco: parseFloat(document.getElementById('productPrice').value)
        };
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            if (!res.ok) throw new Error('Falha ao adicionar');
            productForm.reset();
            fetchAndRenderProducts();
        } catch (error) {
            alert('Falha ao adicionar produto.');
        }
    };

    const removeProduct = async (productId) => {
        if (!confirm('Tem certeza de que deseja remover este produto?')) return;
        try {
            const res = await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Falha ao remover');
            fetchAndRenderProducts();
        } catch (error) {
            alert('Falha ao remover produto.');
        }
    };

    const updateProduct = async (product) => {
        try {
           const res = await fetch(`${API_URL}/${product.id}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(product)
           });
           if (!res.ok) throw new Error('Falha ao atualizar');
           fetchAndRenderProducts();
        } catch (error) {
           alert('Falha ao atualizar produto.');
        }
    };

    // --- FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO ---

    const renderProducts = (productsToRender) => {
        productList.innerHTML = '';
        let totalInventoryValue = 0;
        
        productsToRender.forEach(product => {
            const subtotal = (product.preco || 0) * product.quantidade;
            totalInventoryValue += subtotal;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.id;
            productCard.dataset.product = JSON.stringify(product);

            productCard.innerHTML = `
                <img src="${product.imagem_url || 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" alt="${product.nome}" class="product-image">
                <div class="product-info">
                    <h3>${product.nome}</h3>
                    <p class="product-price">Preço: ${(product.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p class="product-quantity">Estoque: <span class="quantity">${product.quantidade}</span></p>
                    <p class="product-subtotal">Valor em Estoque: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <div class="quantity-controls">
                        <button class="decrease-btn">-</button>
                        <input type="number" value="1" class="quantity-change" min="1" style="width: 50px; text-align: center;">
                        <button class="increase-btn">+</button>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn-remove"><i class="fas fa-trash-alt"></i> Remover</button>
                </div>
            `;
            productList.appendChild(productCard);
        });
        
        const summaryCard = document.getElementById('inventorySummary');
        if (summaryCard) {
            summaryCard.innerHTML = `
                <h3>Valor Total do Estoque</h3>
                <p>${totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            `;
        }
    };

    // --- FUNÇÕES DE RELATÓRIO (MODAL) ---

    const showLowStock = () => {
        const LOW_STOCK_THRESHOLD = 10;
        const lowStockProducts = localProductsCache.filter(p => p.quantidade < LOW_STOCK_THRESHOLD).sort((a, b) => a.quantidade - b.quantidade);
        
        modalTitle.textContent = 'Produtos com Baixo Estoque';
        let reportHTML = '<div class="product-grid">';

        if (lowStockProducts.length > 0) {
            lowStockProducts.forEach(p => {
                reportHTML += `
                    <div class="product-card">
                        <img src="${p.imagem_url || 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" class="product-image">
                        <div class="product-info">
                            <h3>${p.nome}</h3>
                            <p style="color: var(--danger-color); font-weight: bold;">Estoque: ${p.quantidade}</p>
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
        const bestSellers = [...localProductsCache].filter(p => (p.vendas || 0) > 0).sort((a, b) => b.vendas - a.vendas).slice(0, 5);
        
        modalTitle.textContent = 'Top 5 Produtos Mais Vendidos';
        let reportHTML = '<div class="product-grid">';
        
        if (bestSellers.length > 0) {
            bestSellers.forEach(p => {
                reportHTML += `
                    <div class="product-card">
                         <img src="${p.imagem_url || 'https://via.placeholder.com/300x200.png?text=Sem+Imagem'}" class="product-image">
                         <div class="product-info">
                            <h3>${p.nome}</h3>
                            <p style="color: var(--success-color); font-weight: bold;">Vendas: ${p.vendas}</p>
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

    // --- LÓGICA DA BUSCA ---
    const handleSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredProducts = localProductsCache.filter(product => 
            product.nome.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    };


    // --- EVENT LISTENERS (Escutadores de Eventos) ---

    productForm.addEventListener('submit', addProduct);

    productList.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const product = JSON.parse(card.dataset.product);
        const changeAmount = parseInt(card.querySelector('.quantity-change').value, 10) || 1;

        if (e.target.closest('.btn-remove')) {
            removeProduct(product.id);
        } else if (e.target.closest('.decrease-btn')) {
            if (product.quantidade > 0) {
                const amountToDecrease = Math.min(product.quantidade, changeAmount);
                product.quantidade -= amountToDecrease;
                product.vendas = (product.vendas || 0) + amountToDecrease;
                updateProduct(product);
            }
        } else if (e.target.closest('.increase-btn')) {
            product.quantidade += changeAmount;
            updateProduct(product);
        }
    });
    
    // Listeners para os menus e modal
    lowStockMenu.addEventListener('click', showLowStock);
    bestSellersMenu.addEventListener('click', showBestSellers);
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    // ***** LISTENERS DA BUSCA ADICIONADOS AQUI *****
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (event) => {
        // Para buscar ao pressionar Enter ou ao limpar o campo
        if (event.key === 'Enter' || searchInput.value === '') {
            handleSearch();
        }
    });


    // --- CARGA INICIAL ---
    fetchAndRenderProducts();
});