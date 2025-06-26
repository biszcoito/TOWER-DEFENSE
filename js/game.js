class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        
        // Dados Centralizados do Jogo
        this.TOWER_DATA = TOWER_DATA;
        this.ENEMY_DATA = ENEMY_DATA;
        this.WAVE_DATA = WAVE_DATA;

        // Estado do Jogo
        this.lives = 20;
        this.money = 25000;
        this.wave = 0;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.particles = [];
        this.gameOver = false;
        this.waveInProgress = false;

        this.selectedTowerToBuild = null;

        this.ui = new UI(this);
        this.path = [];
        this.mousePos = { x: 0, y: 0 };
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        this.gameLoop = this.gameLoop.bind(this);
        this.start();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth - 280;
        this.canvas.height = window.innerHeight;
        // Recalcular o caminho
        this.path = [
            { x: -50, y: this.canvas.height * 0.4 },
            { x: this.canvas.width * 0.2, y: this.canvas.height * 0.4 },
            { x: this.canvas.width * 0.2, y: this.canvas.height * 0.8 },
            { x: this.canvas.width * 0.7, y: this.canvas.height * 0.8 },
            { x: this.canvas.width * 0.7, y: this.canvas.height * 0.2 },
            { x: this.canvas.width + 50, y: this.canvas.height * 0.2 }
        ];
    }

    start() {
        this.gameLoop(0);
    }
    
    gameLoop(timestamp) {
        if (this.gameOver) {
            this.ctx.fillStyle = "rgba(0,0,0,0.7)"; this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
            this.ctx.fillStyle = "#e94560"; this.ctx.font = "60px Arial"; this.ctx.textAlign="center";
            this.ctx.fillText("FIM DE JOGO", this.canvas.width/2, this.canvas.height/2);
            return;
        }

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        this.towers.forEach(t => t.update(this.enemies, deltaTime));
        this.enemies.forEach(e => e.update(deltaTime));
       for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            // Se o update retornar 'true', significa que o projétil deve ser removido
            if (p.update(deltaTime)) {
                this.projectiles.splice(i, 1);
            }
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (p.update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }
        // Remove inimigos mortos
        for(let i = this.enemies.length-1; i >= 0; i--){
            if(this.enemies[i].isDead()){
                this.money += this.enemies[i].bounty;
                this.enemies.splice(i, 1);
            }
        }
        
        // Checar fim da onda
        if(this.waveInProgress && this.enemies.length === 0){
            this.waveInProgress = false;
            this.ui.enableStartWaveButton();
            if(this.wave >= this.WAVE_DATA.length - 1) { this.gameWin(); }
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
        this.ctx.beginPath(); this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for(let i=1; i<this.path.length; i++){ this.ctx.lineTo(this.path[i].x, this.path[i].y); }
        this.ctx.stroke();
    }

    setSelectedTowerToBuild(type) {
        this.selectedTowerToBuild = (this.selectedTowerToBuild === type) ? null : type;
        this.ui.selectedTower = null; // Desseleciona qualquer torre de upgrade
        this.ui.update();
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (this.selectedTowerToBuild) { // Lógica de construção
            const towerData = this.TOWER_DATA[this.selectedTowerToBuild];
            if(this.money >= towerData.cost) {
                this.money -= towerData.cost;
                this.towers.push(createTower(this, x, y, this.selectedTowerToBuild));
                this.setSelectedTowerToBuild(null);
            }
        } else { // Lógica de seleção de torre para upgrade
            let clickedTower = null;
            for (const t of this.towers) {
                if(Math.hypot(t.x-x, t.y-y) < 20) {
                    clickedTower = t;
                    break;
                }
            }
            this.ui.selectedTower = clickedTower;
            this.ui.update();
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = event.clientX - rect.left;
        this.mousePos.y = event.clientY - rect.top;
    }
    
    startNextWave(){
        if(this.waveInProgress) return;
        this.wave++;
        this.waveInProgress = true;
        
        const waveInfo = this.WAVE_DATA[this.wave];
        if(!waveInfo) { this.gameWin(); return; }
        
        let enemiesToSpawn = [];
        for (const type in waveInfo) {
            for(let i=0; i < waveInfo[type]; i++){ enemiesToSpawn.push(type); }
        }
        enemiesToSpawn.sort(() => Math.random() - 0.5);
        
        const spawnInterval = setInterval(() => {
            if(enemiesToSpawn.length === 0){ clearInterval(spawnInterval); return; }
            const type = enemiesToSpawn.shift();
            this.enemies.push(new Enemy(this, type));
        }, 500);
    }
    
    sellTower(towerToSell){
        let sellValue = 0;
        const baseCost = this.TOWER_DATA[towerToSell.type].cost;
        sellValue += baseCost * 0.7;
        for(let i = 1; i < towerToSell.level; i++){
            sellValue += this.TOWER_DATA[towerToSell.type].levels[i].cost * 0.7;
        }
        this.money += Math.floor(sellValue);
        
        this.towers = this.towers.filter(t => t !== towerToSell);
        this.ui.selectedTower = null;
        this.ui.update();
    }
    
    gameWin() { this.gameOver = true; /* lógica de vitória aqui */ }
}
