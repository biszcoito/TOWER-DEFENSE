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

    // === Bloco 3: A Horda Infinita ===
    { sprinter: 60 },                          // 21: Recuperação de ritmo após a parede.
    { creep: 100 },                            // 22: Teste de resistência. Onda longa e rentável.
    { brute: 4, sprinter: 40 },                // 23: Os brutes criam aberturas para os velozes.
    { creep: 80, brute: 6 },                   // 24: Teste de dano focado em meio à multidão.
    { creep: 40, sprinter: 20, brute: 2 },     // 25: NOVO DESAFIO: A primeira onda com os três tipos!
    { creep: 150 },                            // 26: Onda de dinheiro massiva.
    { sprinter: 90 },                          // 27: Caos veloz. Teste puro para torres de tiro rápido.
    { brute: 12 },                             // 28: Outro teste de dano sustentado, mais forte.
    { creep: 60, sprinter: 40, brute: 5 },     // 29: Um desafio tático mais complexo.
    { brute: 15, creep: 50 },                  // 30: PAREDE DE CARNE: Teste de poder de fogo massivo.
    { sprinter: 120 },                         // 31: Alívio pós-parede, se você tiver defesa contra velocidade.
    { creep: 200 },                            // 32: A maior onda de dinheiro até agora.
    { brute: 10, sprinter: 60 },               // 33: A elite dos brutes com escolta muito rápida.
    { brute: 20 },                             // 34: Teste de DPS bruto. Seus canhões dão conta?
    { creep: 100, sprinter: 50 },              // 35: Um clássico, só que com o dobro da pressão.
    { creep: 100, brute: 10 },                 // 36: Onda longa com tanques no meio para quebrar o ritmo.
    { sprinter: 100, brute: 8 },               // 37: Uma combinação para induzir o pânico.
    { creep: 150, sprinter: 75 },              // 38: Preparação final, uma onda caótica.
    { creep: 100, sprinter: 50, brute: 10 },   // 39: Prévia da parede. Todos os elementos em alta quantidade.
    { brute: 25, sprinter: 50 },               // 40: PAREDE DUPLA: Força E Velocidade. Exige uma defesa versátil.

    // === Bloco 4: A Legião de Ferro ===
    { creep: 300 },                            // 41: Recompensa. O suficiente para um grande upgrade.
    { brute: 20, creep: 100 },                 // 42: O foco é matar os Brutes enquanto segura a maré.
    { sprinter: 200 },                         // 43: Seus lasers precisam estar prontos. Onda da velocidade extrema.
    { creep: 200, sprinter: 100 },             // 44: Uma inundação de inimigos. Dano em área é crucial.
    { brute: 30 },                             // 45: A primeira "Grande Parede de Brutes". Sem distrações.
    { sprinter: 150, brute: 15 },              // 46: Outro teste de pânico. Tentar matar os brutes é um erro?
    { creep: 400 },                            // 47: Uma maratona.
    { brute: 15, creep: 200 },                 // 48: Os brutes estão bem protegidos no meio da horda.
    { creep: 150, sprinter: 100, brute: 15 },  // 49: A tempestade perfeita.
    { brute: 40, creep: 100 },                 // 50: PAREDE ELITE: Foco total nos Brutes é a única saída.
    { sprinter: 250 },                         // 51: Uma breve chance de respirar. Rápida e mortal.
    { creep: 500 },                            // 52: O último "descanso" econômico.
    { brute: 30, sprinter: 100 },              // 53: A Legião com sua cavalaria.
    { creep: 300, brute: 20 },                 // 54: Pressão constante.
    { sprinter: 300 },                         // 55: O chão está borrado.
    { brute: 50 },                             // 56: Teste final de DPS contra Brutes.
    { creep: 250, sprinter: 150 },             // 57: Quantidade sobre qualidade.
    { sprinter: 200, brute: 25 },              // 58: Prepara o coração para a próxima onda.
    { creep: 300, sprinter: 100, brute: 25 },  // 59: O teste final antes da grande parede.
    { brute: 60, sprinter: 120 },              // 60: PAREDE DO DESESPERO: Força máxima e velocidade máxima.

    // === Bloco 5: O Fim Está Próximo ===
    // A partir daqui, as ondas são projetadas para testar os limites de uma defesa otimizada.
    { creep: 800 },                            // 61: A onda do "obrigado pelos upgrades".
    { sprinter: 500 },                         // 62: Piscou, perdeu. Teste de tempo de reação.
    { brute: 75 },                             // 63: Uma procissão lenta da morte. Teste de resistência da defesa.
    { creep: 400, sprinter: 300 },             // 64: Pura densidade.
    { brute: 40, sprinter: 200 },              // 65: Os sprinters são a ameaça real; os brutes, a distração.
    { creep: 500, brute: 30 },                 // 66: Quase impossível focar nos brutes.
    { brute: 50, creep: 300 },                 // 67: Combinação de elite.
    { sprinter: 400, brute: 20 },              // 68: Uma inversão do teste anterior.
    { creep: 400, sprinter: 200, brute: 30 },  // 69: O caos final em forma de onda.
    { brute: 100 },                            // 70: A GRANDE PAREDE. Se você passar disso, está no endgame.
    { creep: 1000 },                           // 71: Uma onda para celebrar a vitória... ou quebrar seu PC.
    { sprinter: 600 },                         // 72: A definição de "overwhelm".
    { brute: 60, sprinter: 300 },              // 73: Combinação de endgame.
    { creep: 600, brute: 50 },                 // 74: Sem trégua.
    { sprinter: 750 },                         // 75: Você deveria ter investido em torres de laser.
    { brute: 120 },                            // 76: A marcha dos titãs.
    { creep: 500, sprinter: 500 },             // 77: Equilíbrio do caos.
    { brute: 80, creep: 400 },                 // 78: Sem esperança de foco. Apenas dano em área massivo.
    { creep: 500, sprinter: 300, brute: 50 },  // 79: A última mistura antes do fim do bloco.
    { brute: 100, sprinter: 250 },             // 80: PAREDE APOCALÍPTICA: Um ataque implacável e esmagador.
    
    // === Bloco 6: Modo Sobrevivência (Números Absurdos) ===
    { creep: 1500 },                           // 81: Uma última fonte massiva de dinheiro.
    { sprinter: 1000 },                        // 82: Injusto.
    { brute: 150 },                            // 83: O cemitério das torres de canhão.
    { creep: 800, brute: 80 },                 // 84: Resistência sobre resistência.
    { sprinter: 800, brute: 60 },              // 85: A onda que te força a vender e reconstruir.
    { creep: 1000, sprinter: 500 },            // 86: Densidade máxima.
    { brute: 200 },                            // 87: Simplesmente... não.
    { creep: 1000, sprinter: 500, brute: 75 }, // 88: Teste de tudo.
    { brute: 120, sprinter: 600 },             // 89: O pesadelo final.
    { creep: 2000 },                           // 90: CHEFE DE BLOCO (OCULTO): A Horda Que Não Acaba.
    // ...as ondas 91-119 continuariam essa tendência...
    { brute: 250 },                            // 91
    { sprinter: 1500 },                        // 92
    { creep: 1500, brute: 100 },               // 93
    { sprinter: 1000, brute: 100 },            // 94
    { creep: 2500 },                           // 95
    { brute: 300 },                            // 96
    { sprinter: 2000 },                        // 97
    { creep: 2000, sprinter: 1000 },           // 98
    { brute: 200, sprinter: 800 },             // 99
    { brute: 400 },                            // 100: A ONDA DOURADA: O desafio final de dano.
    { creep: 5000 },                           // 101: O início do modo infinito real.
    { sprinter: 3000 },                        // 102
    { brute: 500 },                            // 103
    { creep: 2000, brute: 200 },               // 104
    { sprinter: 2000, brute: 150 },            // 105
    { creep: 3000, sprinter: 1500 },           // 106
    { brute: 600 },                            // 107
    { creep: 2500, sprinter: 1000, brute: 100},// 108
    { sprinter: 4000 },                        // 109
    { brute: 750 },                            // 110
    { creep: 7000 },                           // 111
    { brute: 500, sprinter: 2000 },            // 112
    { creep: 5000, brute: 250 },               // 113
    { sprinter: 5000 },                        // 114
    { brute: 800 },                            // 115
    { creep: 5000, sprinter: 3000 },           // 116
    { brute: 1000 },                           // 117: MIL BRUTES!
    { sprinter: 6000 },                        // 118
    { creep: 10000 },                          // 119: Onda do Lag.
    { creep: 5000, sprinter: 5000, brute: 500 }// 120: O FIM. Parabéns, você sobreviveu ao impossível.
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
