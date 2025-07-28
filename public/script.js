document.addEventListener('DOMContentLoaded', () => {
    // Seletores de Elementos
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');
    const API_URL = '/api/produtos';

    // Função para buscar e renderizar os produtos
    const fetchAndRenderProducts = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao buscar produtos.');
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error(error);
            productList.innerHTML = `<p style="color:red;">Falha ao carregar produtos.</p>`;
        }
    };

    // Função para renderizar os produtos na tela
    const renderProducts = (productsToRender) => {
        productList.innerHTML = '';
        let totalInventoryValue = 0;
        
        productsToRender.forEach(product => {
            const subtotal = (product.preco || 0) * product.quantidade;
            totalInventoryValue += subtotal;

            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // Armazena todos os dados do produto no próprio elemento HTML
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

    // Função para ADICIONAR um produto
    const addProduct = async (e) => {
        e.preventDefault();
        const newProduct = {
            nome: document.getElementById('productName').value,
            imagemUrl: document.getElementById('productImage').value,
            quantidade: parseInt(document.getElementById('productQuantity').value, 10),
            preco: parseFloat(document.getElementById('productPrice').value)
        };
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            productForm.reset();
            fetchAndRenderProducts();
        } catch (error) {
            alert('Falha ao adicionar produto.');
        }
    };
    
    // Função para DELETAR um produto
    const removeProduct = async (productId) => {
        if (!confirm('Tem certeza de que deseja remover este produto?')) return;
        try {
            await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
            fetchAndRenderProducts();
        } catch (error) {
            alert('Falha ao remover produto.');
        }
    };
    
    // Função para ATUALIZAR um produto
    const updateProduct = async (product) => {
        try {
           await fetch(`${API_URL}/${product.id}`, {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(product)
           });
           fetchAndRenderProducts(); // Recarrega tudo para garantir consistência
        } catch (error) {
           alert('Falha ao atualizar produto.');
        }
    };

    // Delegação de eventos para a lista de produtos
    productList.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const product = JSON.parse(card.dataset.product);
        const changeAmount = parseInt(card.querySelector('.quantity-change').value, 10) || 1;

        if (e.target.closest('.btn-remove')) {
            removeProduct(product.id);
        } else if (e.target.closest('.decrease-btn')) {
            product.quantidade = Math.max(0, product.quantidade - changeAmount);
            product.vendas += changeAmount; // Simula venda
            updateProduct(product);
        } else if (e.target.closest('.increase-btn')) {
            product.quantidade += changeAmount;
            updateProduct(product);
        }
    });

    // Event listener para o formulário
    productForm.addEventListener('submit', addProduct);

    // Carga inicial
    fetchAndRenderProducts();
});