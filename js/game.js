// js/game.js

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        
        // Mantém referência aos dados estáticos
        this.TOWER_DATA = TOWER_DATA;
        this.ENEMY_DATA = ENEMY_DATA;
        this.WAVE_DATA = WAVE_DATA;

        // Estado do jogo
        this.lives = 20;
        this.money = 500; // ★ MUDANÇA: Valor ajustado para uma experiência padrão
        this.wave = 0;
        this.score = 0;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.particles = [];
        this.gameIsOver = false;
        this.waveInProgress = false;

        // Estado da UI e do jogador
        this.selectedTowerToBuild = null;
        this.mousePos = { x: 0, y: 0 };
        
        // Componentes e inicialização
        this.ui = new UI(this);
        this.path = [];
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        this.animationFrameId = null; 
        this.gameLoop = this.gameLoop.bind(this);
        this.start();
    }

    // ★ MUDANÇA: Novo mapa estratégico, mais longo e com mais curvas
    resizeCanvas() {
        this.canvas.width = window.innerWidth - 280;
        this.canvas.height = window.innerHeight;

        const w = this.canvas.width;
        const h = this.canvas.height;
        this.path = [
            { x: -50, y: h * 0.15 }, // Ponto de partida
            { x: w * 0.2, y: h * 0.15 },
            { x: w * 0.2, y: h * 0.85 },
            { x: w * 0.8, y: h * 0.85 },
            { x: w * 0.8, y: h * 0.15 },
            { x: w * 0.5, y: h * 0.15 },
            { x: w * 0.5, y: h * 0.5 },
            { x: w + 50, y: h * 0.5 }, // Ponto de saída
        ];
    }

    start() {
        this.gameLoop(0);
    }
    
    gameLoop(timestamp) {
        if (this.gameIsOver) {
            cancelAnimationFrame(this.animationFrameId);
            return;
        }

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        if (this.lives <= 0 && !this.gameIsOver) {
            this.handlePlayerDefeat();
            return;
        }
        
        this.towers.forEach(t => t.update(this.enemies, deltaTime));
        this.enemies.forEach(e => {
            e.update(deltaTime);
            if (e.hasReachedEnd && !e.isDead()) {
                this.lives--;
                e.health = 0; // Marca o inimigo como derrotado para ser removido sem dar dinheiro
                if(this.lives <= 0) this.lives = 0;
            }
        });

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            if (this.projectiles[i].update(deltaTime)) {
                this.projectiles.splice(i, 1);
            }
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (this.particles[i].update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }

        this.handleEnemyDefeats();

        // ★ MUDANÇA: Lógica de fim de onda com bônus financeiro
        if (this.waveInProgress && this.enemies.length === 0) {
            this.waveInProgress = false;
            
            // Bônus de fim de onda para ajudar na economia
            const waveBonus = 100 + this.wave;
            this.money += waveBonus;
            // Efeito visual para o bônus
            this.particles.push(new MoneyParticle(this.game, this.canvas.width / 2, this.canvas.height - 20, `+$${waveBonus}`));
            
            this.ui.enableStartWaveButton();

            // Lógica de vitória (ajustada para ondas futuras)
            if (this.wave >= this.WAVE_DATA.length - 1) {
                this.gameWin();
            }
        }
    }
    
    handleEnemyDefeats() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.isDead()) {
                // Só ganha dinheiro e pontos se o inimigo for derrotado ANTES de chegar ao fim
                if (enemy.health <= 0 && !enemy.hasReachedEnd) {
                   this.money += enemy.bounty;
                   this.score += enemy.bounty;
                }
                this.enemies.splice(i, 1);
            }
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPath();
        
        this.towers.forEach(t => t.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        
        this.ui.draw();
    }
    
    drawPath() {
        this.ctx.strokeStyle = '#0f3460'; this.ctx.lineWidth = 40;
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for(let i = 1; i < this.path.length; i++){
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
    }
        
    handleCanvasClick(event) {
        if (this.gameIsOver) return;
    
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        if (this.selectedTowerToBuild) {
            const towerType = this.selectedTowerToBuild;
    
            if (towerType === 'drone_carrier') {
                const droneCarrierCount = this.towers.filter(t => t.type === 'drone_carrier').length;
                const DRONE_CARRIER_LIMIT = 3;
    
                if (droneCarrierCount >= DRONE_CARRIER_LIMIT) {
                    alert(`Limite de ${DRONE_CARRIER_LIMIT} Porta-Drones atingido!`);
                    this.setSelectedTowerToBuild(null);
                    return;
                }
            }
            
            const towerData = this.TOWER_DATA[towerType];
            if (this.money >= towerData.cost) {
                this.money -= towerData.cost;
    
                const newTower = createTower(this, x, y, towerType);
                this.towers.push(newTower);
    
                if (newTower.type === 'damage_amp') {
                    this.towers.forEach(t => t.recalculateBoost());
                }
    
                this.setSelectedTowerToBuild(null);
            } else {
                alert('Dinheiro insuficiente!');
                this.setSelectedTowerToBuild(null);
            }
    
        } else {
            let clickedTower = null;
            for (const t of this.towers) {
                if (Math.hypot(t.x - x, t.y - y) < 20) {
                    clickedTower = t;
                    break;
                }
            }
            // Lógica para alternar a seleção da torre na UI
            this.ui.selectedTower = (this.ui.selectedTower === clickedTower) ? null : clickedTower;
        }
    }
    
    setSelectedTowerToBuild(type) {
        // Desseleciona a torre se clicar no mesmo botão novamente
        this.selectedTowerToBuild = (this.selectedTowerToBuild === type) ? null : type;
        this.ui.selectedTower = null; // Garante que o painel de upgrade feche ao selecionar uma torre para construir
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = event.clientX - rect.left;
        this.mousePos.y = event.clientY - rect.top;
    }
    
    startNextWave() {
        if (this.waveInProgress || this.gameIsOver) return;
        this.wave++;
        this.waveInProgress = true;
        
        const waveInfo = this.WAVE_DATA[this.wave];
        if (!waveInfo) { 
            this.gameWin(); 
            return;
        }
        
        let enemiesToSpawn = [];
        for (const type in waveInfo) {
            for(let i = 0; i < waveInfo[type]; i++){ 
                enemiesToSpawn.push(type);
            }
        }
        // Embaralha para tornar a ordem de spawn um pouco mais variada
        enemiesToSpawn.sort(() => Math.random() - 0.5); 
        
        const spawnInterval = setInterval(() => {
            if (this.gameIsOver || enemiesToSpawn.length === 0) {
                clearInterval(spawnInterval);
                return;
            }
            const type = enemiesToSpawn.shift();
            this.enemies.push(new Enemy(this, type));
        }, 500); // Meio segundo entre cada inimigo da onda
    }
    
    getSellValue(tower) {
        let totalCost = this.TOWER_DATA[tower.type].cost;
        for (let i = 1; i < tower.level; i++) {
            totalCost += this.TOWER_DATA[tower.type].levels[i].cost;
        }
        return Math.floor(totalCost * 0.7); // Vende por 70% do valor investido
    }
    
    sellTower(towerToSell){
        const sellValue = this.getSellValue(towerToSell);
        this.money += sellValue;
        
        // Remove a torre da lista
        this.towers = this.towers.filter(t => t !== towerToSell);
        this.ui.selectedTower = null;
    
        // Se a torre vendida era um amplificador, recalcula o bônus das outras torres
        if(towerToSell.type === 'damage_amp'){
            this.towers.forEach(t => t.recalculateBoost());
        }
    }
    
    handlePlayerDefeat() {
        if (this.gameIsOver) return;
        this.gameIsOver = true;
        this.ui.showScoreModal(this.score);
    }
    
    gameWin() {
        if (this.gameIsOver) return;
        this.gameIsOver = true;
        // Bônus final por vidas restantes
        this.score += this.lives * 50; 
        this.ui.showScoreModal(this.score);
    }
}