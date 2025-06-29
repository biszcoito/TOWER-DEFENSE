const ENEMY_DATA = {
    creep:    { health:100,  speed:1.5, bounty:5, color:'#e63946' },
    sprinter: { health:70,   speed:4.5, bounty:8, color:'#f72585' },
    brute:    { health:1500, speed:1,   bounty:25, color:'#7209b7' },
};
const WAVE_DATA = [
    null, // Wave 0
    // === Bloco 1: O Básico ===
    { creep: 10 },                             // 1: Introduzindo o inimigo base.
    { creep: 15 },                             // 2: Um pouco mais do mesmo, fácil.
    { creep: 10, sprinter: 5 },                // 3: Introduzindo o Sprinter!
    { creep: 25 },                             // 4: Onda de Ritmo, só creeps.
    { brute: 1 },                              // 5: Introduzindo o Brute! Um mini-chefe.
    { creep: 15, sprinter: 10 },               // 6: Teste: Consegue lidar com velocidade e quantidade?
    { sprinter: 25 },                          // 7: Teste de velocidade pura. Canhões sofrem aqui.
    { creep: 20, brute: 1 },                   // 8: Teste: O Brute distrai enquanto os creeps passam.
    { sprinter: 15, brute: 2 },                // 9: Teste avançado.
    { brute: 5 },                              // 10: PAREDE! A primeira onda de Brutes.
    // === Bloco 2: Combinações e Economia ===
    { creep: 50 },                             // 11: Onda de Ritmo e dinheiro fácil.
    { creep: 20, sprinter: 20 },               // 12: Equilíbrio de inimigos.
    { brute: 3, sprinter: 15 },                // 13: Agora o Brute vem com cobertura rápida.
    { sprinter: 40 },                          // 14: Outro teste de velocidade, mais intenso.
    { brute: 5, creep: 20 },                   // 15: PAREDE SUAVE: 5 Brutes espaçados com creeps.
    { brute: 2, sprinter: 30 },                // 16: Teste de prioridade. Quem focar?
    { creep: 80 },                             // 17: Onda de dinheiro massiva, mas longa.
    { brute: 8 },                              // 18: Sequência de Brutes. Teste de dano sustentado.
    { brute: 5, sprinter: 25 },                // 19: Onda bem difícil antes da parede.
    { brute: 10, creep: 25 },                  // 20: PAREDE! Força o jogador a ter dano em área e focado.
    // ...podemos continuar gerando ondas a partir daqui com uma função.
];

class Enemy {
    constructor(game, type){
        this.game = game;
        this.type = type;
        Object.assign(this, ENEMY_DATA[type]);
        this.maxHealth = this.health * (1 + (this.game.wave * 0.2));
        this.health = this.maxHealth;
        this.x = this.game.path[0].x;
        this.y = this.game.path[0].y;
        this.pathIndex = 0;
        
        this.slowEffect = {multiplier:1, duration:0};

        this.hasReachedEnd = false;
    }
    update(deltaTime){
        const speed = this.speed * this.slowEffect.multiplier;
        
        if(this.slowEffect.duration > 0) this.slowEffect.duration -= deltaTime;
        else this.slowEffect.multiplier = 1;
        
        const targetPoint = this.game.path[this.pathIndex+1];
        if(!targetPoint) {
            // MUDANÇA: Apenas sinaliza que chegou ao fim. Não altera mais o jogo.
            this.hasReachedEnd = true;
            return;
        }
        const angle = Math.atan2(targetPoint.y - this.y, targetPoint.x - this.x);
        this.x += Math.cos(angle) * speed;
        this.y += Math.sin(angle) * speed;
        
        if(Math.hypot(this.x - targetPoint.x, this.y-targetPoint.y) < speed) this.pathIndex++;
    }
    draw(ctx){
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x,this.y,12,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='red'; ctx.fillRect(this.x-15, this.y-25, 30, 5);
        ctx.fillStyle='lime'; ctx.fillRect(this.x-15, this.y-25, 30*(this.health/this.maxHealth),5);
        
        if(this.slowEffect.multiplier < 1){
            ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
            ctx.beginPath(); ctx.arc(this.x,this.y,14,0,Math.PI*2); ctx.fill();
        }
    }
    applySlow(multiplier, duration){ this.slowEffect = {multiplier: 1-multiplier, duration}; }
    isDead() { return this.health <= 0; }
}