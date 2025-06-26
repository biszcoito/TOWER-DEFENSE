// main.js - Inicia tudo!

// Espera o DOM carregar para garantir que o canvas existe.
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas não encontrado!");
        return;
    }
    
    // O Jogo só começa quando o DOM estiver pronto
    const game = new Game(canvas);
    
    // Isso é útil para depuração no console do navegador
    window.game = game;
});