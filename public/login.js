document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const username = event.target.username.value;
        const password = event.target.password.value;

        // --- AUTENTICAÇÃO SIMULADA ---
        // Em um sistema real, isso seria uma chamada de API para o backend
        const USUARIO_CORRETO = 'lucasmercantil';
        const SENHA_CORRETA = 'mercantil2025';

        if (username === USUARIO_CORRETO && password === SENHA_CORRETA) {
            // Se o login estiver correto, salvamos um "indicador" na sessão do navegador
            sessionStorage.setItem('loggedIn', 'true');
            // Redireciona para a página principal dos produtos
            window.location.href = 'index.html';
        } else {
            errorMessage.textContent = 'Usuário ou senha inválidos!';
        }
    });
});